import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSounds } from './useSounds'

const modes = ['Pomodoro', 'Short Break', 'Long Break']
const TIMER_STORAGE_KEY = 'cafe-timer'

function loadSavedTimer() {
  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getDurationSeconds(durations, mode) {
  return Math.max(1, Math.round((durations?.[mode] ?? 25) * 60))
}

function getRemainingSeconds(endAt) {
  return Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
}

function createTimerWorker() {
  if (typeof Worker === 'undefined' || typeof Blob === 'undefined') return null

  const source = `
    let intervalId = null;
    let endAt = null;

    function remainingSeconds() {
      return Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    }

    function stop() {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      endAt = null;
    }

    function tick() {
      if (!endAt) return;
      const timeLeft = remainingSeconds();
      postMessage({ type: 'tick', timeLeft });
      if (timeLeft <= 0) {
        stop();
        postMessage({ type: 'done' });
      }
    }

    onmessage = (event) => {
      if (event.data?.type === 'start') {
        stop();
        endAt = event.data.endAt;
        tick();
        intervalId = setInterval(tick, 500);
      }

      if (event.data?.type === 'stop') {
        stop();
      }
    };
  `

  try {
    const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }))
    const worker = new Worker(url)
    return { worker, url }
  } catch {
    return null
  }
}

function requestNotificationPermission() {
  if (!('Notification' in window) || Notification.permission !== 'default') return

  try {
    const request = Notification.requestPermission()
    if (request?.catch) request.catch(() => {})
  } catch {
    // Older browser implementations can expose a different permission API.
  }
}

function showTimerNotification(mode) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  try {
    new Notification(`${mode} complete`, {
      body: 'Time is up.',
      tag: 'cafe-pomodoro-timer',
      requireInteraction: true,
    })
  } catch {
    // Notifications can fail in unsupported browser/privacy contexts.
  }
}

export default function Timer({
  durations,
  longBreakInterval = 4,
  autoSwitchEnabled = true,
  onOpenSettings,
}) {
  const savedTimer = useMemo(loadSavedTimer, [])
  const savedMode = modes.includes(savedTimer?.mode) ? savedTimer.mode : 'Pomodoro'
  const savedEndAt = typeof savedTimer?.endAt === 'number' ? savedTimer.endAt : null
  const savedTimeLeft = typeof savedTimer?.timeLeft === 'number' ? savedTimer.timeLeft : null
  const savedStillRunning = savedTimer?.running && savedEndAt && savedEndAt > Date.now()

  const [mode, setMode] = useState(savedMode)
  const durationSeconds = getDurationSeconds(durations, mode)
  const [timeLeft, setTimeLeft] = useState(() => {
    if (savedStillRunning) return getRemainingSeconds(savedEndAt)
    return savedTimeLeft ?? getDurationSeconds(durations, savedMode)
  })
  const [running, setRunning] = useState(() => Boolean(savedStillRunning))
  const [endAt, setEndAt] = useState(() => (savedStillRunning ? savedEndAt : null))
  const [intervals, setIntervals] = useState(() => {
    return typeof savedTimer?.intervals === 'number' ? savedTimer.intervals : 0
  })
  const completionHandledRef = useRef(false)
  const didMountRef = useRef(false)

  const { playAlarm, playClick, playToggle, unlockSounds } = useSounds()

  // Persist timer state
  useEffect(() => {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({ mode, timeLeft, running, endAt, intervals }))
  }, [mode, timeLeft, running, endAt, intervals])

  // Reset timer when mode or durations change
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    completionHandledRef.current = false
    setRunning(false)
    setEndAt(null)
    setTimeLeft(durationSeconds)
  }, [mode, durationSeconds])

  const completeTimer = useCallback(() => {
    if (completionHandledRef.current) return

    const completedPomodoros = mode === 'Pomodoro' ? intervals + 1 : intervals
    const safeLongBreakInterval = Math.max(1, Math.round(longBreakInterval) || 4)
    const nextMode = mode === 'Pomodoro'
      ? completedPomodoros % safeLongBreakInterval === 0
        ? 'Long Break'
        : 'Short Break'
      : 'Pomodoro'

    completionHandledRef.current = true
    setRunning(false)
    setEndAt(null)
    setTimeLeft(autoSwitchEnabled ? getDurationSeconds(durations, nextMode) : 0)

    if (mode === 'Pomodoro') {
      setIntervals(completedPomodoros)
    }

    if (autoSwitchEnabled) {
      setMode(nextMode)
    }

    playAlarm()
    showTimerNotification(mode)
  }, [autoSwitchEnabled, durations, intervals, longBreakInterval, mode, playAlarm])

  // Countdown tick
  useEffect(() => {
    if (!running || !endAt) return

    let stopped = false
    const workerTimer = createTimerWorker()

    const syncFromClock = () => {
      const nextTimeLeft = getRemainingSeconds(endAt)
      setTimeLeft(nextTimeLeft)
      if (nextTimeLeft <= 0) completeTimer()
    }

    if (workerTimer) {
      workerTimer.worker.onmessage = (event) => {
        if (stopped) return

        if (event.data?.type === 'tick') {
          setTimeLeft(event.data.timeLeft)
        }

        if (event.data?.type === 'done') {
          completeTimer()
        }
      }
      workerTimer.worker.postMessage({ type: 'start', endAt })
    }

    const fallbackId = workerTimer ? null : window.setInterval(syncFromClock, 500)

    const handleResume = () => syncFromClock()
    document.addEventListener('visibilitychange', handleResume)
    window.addEventListener('focus', handleResume)
    window.addEventListener('pageshow', handleResume)
    syncFromClock()

    return () => {
      stopped = true
      if (fallbackId) window.clearInterval(fallbackId)
      if (workerTimer) {
        workerTimer.worker.postMessage({ type: 'stop' })
        workerTimer.worker.terminate()
        URL.revokeObjectURL(workerTimer.url)
      }
      document.removeEventListener('visibilitychange', handleResume)
      window.removeEventListener('focus', handleResume)
      window.removeEventListener('pageshow', handleResume)
    }
  }, [running, endAt, completeTimer])

  const format = s => {
    const mm = Math.floor(s / 60).toString().padStart(2, '0')
    const ss = Math.floor(s % 60).toString().padStart(2, '0')
    return `${mm}:${ss}`
  }

  const handleStartPause = () => {
    playClick()
    if (running) {
      const nextTimeLeft = endAt ? getRemainingSeconds(endAt) : timeLeft
      setTimeLeft(nextTimeLeft)
      setEndAt(null)
      setRunning(false)
      return
    }

    const nextTimeLeft = timeLeft > 0 ? timeLeft : durationSeconds
    completionHandledRef.current = false
    unlockSounds()
    requestNotificationPermission()
    setTimeLeft(nextTimeLeft)
    setEndAt(Date.now() + nextTimeLeft * 1000)
    setRunning(true)
  }

  const handleReset = () => {
    playToggle()
    completionHandledRef.current = false
    setRunning(false)
    setEndAt(null)
    setTimeLeft(durationSeconds)
  }

  const handleModeChange = (item) => {
    playToggle()
    completionHandledRef.current = false
    setRunning(false)
    setEndAt(null)
    setTimeLeft(getDurationSeconds(durations, item))
    setMode(item)
  }

  const handleResetIntervals = () => {
    const confirmed = window.confirm(
      '☕ Reset intervals & progress?\n\nThis will clear your completed interval count. Are you sure?'
    )
    if (confirmed) {
      playToggle()
      setIntervals(0)
    }
  }

  return (
    <>
      <style>{`
        .interval-row {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .interval-reset-btn {
          width: 1.6rem;
          height: 1.6rem;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.07);
          border: 1px solid rgba(0, 0, 0, 0.1);
          color: var(--accent);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 180ms ease, transform 180ms ease, background 180ms ease;
          padding: 0;
          box-shadow: none !important;
          flex-shrink: 0;
        }

        .interval-reset-btn:hover {
          opacity: 1;
          transform: rotate(-45deg);
          background: rgba(0, 0, 0, 0.13);
        }

        /* hide the reset button when intervals = 0 so it's unobtrusive */
        .interval-reset-btn[data-hidden="true"] {
          opacity: 0;
          pointer-events: none;
        }
      `}</style>

      <section className="timer-card animate-card" aria-label="Pomodoro Timer">
        <div className="timer-header mb-6">
          <div className="timer-modes">
            {modes.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => handleModeChange(item)}
                className={`mode-btn ${mode === item ? 'mode-btn-active' : ''}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div
            className={`timer-number ${running ? 'timer-running' : ''}`}
            role="timer"
            aria-live="polite"
          >
            {format(timeLeft)}
          </div>

          <div className="timer-actions mt-8 flex items-center justify-center gap-4 flex-wrap">
            {/* Settings gear */}
            <button
              type="button"
              className="icon-btn settings-icon"
              onClick={() => { playToggle(); onOpenSettings() }}
              aria-label="Open settings"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M19.4 12C19.4 12.58 19.34 13.16 19.22 13.72L21.5 15.4L19.88 18.12L17.24 17.1C16.6 17.58 15.89 17.94 15.11 18.18L14.58 20.96H9.42L8.89 18.18C8.11 17.94 7.4 17.58 6.76 17.1L4.12 18.12L2.5 15.4L4.78 13.72C4.66 13.16 4.6 12.58 4.6 12C4.6 11.42 4.66 10.84 4.78 10.28L2.5 8.6L4.12 5.88L6.76 6.9C7.4 6.42 8.11 6.06 8.89 5.82L9.42 3.04H14.58L15.11 5.82C15.89 6.06 16.6 6.42 17.24 6.9L19.88 5.88L21.5 8.6L19.22 10.28C19.34 10.84 19.4 11.42 19.4 12Z" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
            </button>

            {/* Start / Pause */}
            <button
              type="button"
              onClick={handleStartPause}
              className="start-btn"
              aria-label={running ? 'Pause timer' : 'Start timer'}
            >
              {running ? 'Pause' : 'Start'}
            </button>

            {/* Reset timer */}
            <button
              type="button"
              onClick={handleReset}
              className="icon-btn"
              aria-label="Reset timer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M7.5 8C8.88 6.64 10.87 5.75 13 5.75C17.22 5.75 20.75 9.28 20.75 13.5C20.75 17.72 17.22 21.25 13 21.25C9.01 21.25 5.68 18.39 5.18 14.56" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M5.5 4.5V8H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Intervals row — count + reset button side by side */}
          <div className="interval-row">
            <span className="interval-text" style={{ margin: 0 }}>
              intervals completed: {intervals}
            </span>

            {/* Reset intervals — only visible when intervals > 0 */}
            <button
              type="button"
              className="interval-reset-btn"
              data-hidden={intervals === 0 ? 'true' : 'false'}
              onClick={handleResetIntervals}
              aria-label="Reset interval count"
              title="Reset intervals"
            >
              {/* Broom / sweep icon — clear/reset metaphor */}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 18H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
