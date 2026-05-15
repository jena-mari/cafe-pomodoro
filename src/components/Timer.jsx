import React, { useState, useEffect, useRef } from 'react'

const presets = {
  Pomodoro: 25 * 60,
  'Short Break': 5 * 60,
  'Long Break': 15 * 60
}

export default function Timer(){
  const [mode, setMode] = useState('Pomodoro')
  const [timeLeft, setTimeLeft] = useState(presets[mode])
  const [running, setRunning] = useState(false)
  const audioRef = useRef(null)

  // Load persisted timer state on mount
  useEffect(()=>{
    try{
      const raw = localStorage.getItem('cafe-timer')
      if(raw){
        const data = JSON.parse(raw)
        if(data.mode) setMode(data.mode)
        if(typeof data.timeLeft === 'number') setTimeLeft(data.timeLeft)
        if(typeof data.running === 'boolean') setRunning(!!data.running)
      }
    }catch(e){ }
  },[])

  // Persist timer state
  useEffect(()=>{
    const payload = { mode, timeLeft, running }
    localStorage.setItem('cafe-timer', JSON.stringify(payload))
  },[mode, timeLeft, running])

  // Reset time when mode changes (unless a persisted time exists for that mode)
  useEffect(()=>{
    setTimeLeft(presets[mode])
    setRunning(false)
  },[mode])

  useEffect(()=>{
    if(!running) return
    const id = setInterval(()=>{
      setTimeLeft(t => {
        if(t <= 1){
          setRunning(false)
          audioRef.current?.play()
          return 0
        }
        return t-1
      })
    }, 1000)
    return ()=> clearInterval(id)
  },[running])

  const format = s => {
    const mm = Math.floor(s/60).toString().padStart(2,'0')
    const ss = Math.floor(s%60).toString().padStart(2,'0')
    return `${mm}:${ss}`
  }

  return (
    <section className="card" aria-label="Pomodoro Timer">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {Object.keys(presets).map(k=> (
            <button key={k} onClick={()=>setMode(k)} aria-pressed={mode===k} className={`px-3 py-1 rounded-full ${mode===k? 'bg-[color:var(--accent)] text-white':'bg-[color:var(--muted)]'}`}>
              {k}
            </button>
          ))}
        </div>
        <div className="text-sm opacity-80" aria-hidden>{mode}</div>
      </div>

      <div className="text-center">
        <div className={`timer-number font-denton mb-4 ${running? 'timer-running':''}`} role="timer" aria-live="polite">{format(timeLeft)}</div>
        <div className="flex items-center justify-center gap-4">
          <button onClick={()=>setRunning(r=>!r)} aria-label={running? 'Pause timer':'Start timer'} className={`btn btn-accent`}>{running? 'Pause':'Start'}</button>
          <button onClick={()=>{setRunning(false); setTimeLeft(presets[mode])}} aria-label="Reset timer" className="btn btn-muted">Reset</button>
        </div>
      </div>

      <audio ref={audioRef} src="/components/alarm_sound.wav" preload="auto" />
    </section>
  )
}
