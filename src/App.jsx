import React, { useEffect, useState } from 'react'
import Timer from './components/Timer'
import TodoList from './components/TodoList'
import Settings from './components/Settings'
import Footer from './components/Footer'

const defaultDurations = {
  Pomodoro: 25,
  'Short Break': 5,
  'Long Break': 15,
}

const defaultTimerSettings = {
  longBreakInterval: 4,
  autoSwitchEnabled: true,
}

function loadSettings() {
  try {
    const raw = localStorage.getItem('cafe-settings')
    if (raw) return JSON.parse(raw)
  } catch {
    return null
  }
  return null
}

export default function App() {
  const savedSettings = loadSettings()
  const [theme, setTheme] = useState(() => savedSettings?.theme || 'coffee')
  const [durations, setDurations] = useState(() => savedSettings?.durations || defaultDurations)
  const [longBreakInterval, setLongBreakInterval] = useState(() => {
    if (!Number.isFinite(savedSettings?.longBreakInterval)) {
      return defaultTimerSettings.longBreakInterval
    }

    return Math.max(1, Math.round(savedSettings.longBreakInterval))
  })
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(() => {
    return typeof savedSettings?.autoSwitchEnabled === 'boolean'
      ? savedSettings.autoSwitchEnabled
      : defaultTimerSettings.autoSwitchEnabled
  })
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Persist whenever settings change
  useEffect(() => {
    localStorage.setItem(
      'cafe-settings',
      JSON.stringify({ theme, durations, longBreakInterval, autoSwitchEnabled })
    )
  }, [theme, durations, longBreakInterval, autoSwitchEnabled])

  // Apply theme class to <html> so all CSS variable rules in styles.css take effect
  useEffect(() => {
    // Remove any previous theme class
    document.documentElement.classList.forEach(cls => {
      if (cls.startsWith('theme-')) document.documentElement.classList.remove(cls)
    })
    document.documentElement.classList.add(`theme-${theme}`)
  }, [theme])

  const handleSave = ({
    durations: newDurations,
    theme: newTheme,
    longBreakInterval: newLongBreakInterval,
    autoSwitchEnabled: newAutoSwitchEnabled,
  }) => {
    setDurations(newDurations)
    setTheme(newTheme)
    setLongBreakInterval(newLongBreakInterval)
    setAutoSwitchEnabled(newAutoSwitchEnabled)
    setSettingsOpen(false)
  }

  return (
    <div className="app-root">
      <main className="page-container">
        <section className="page-screen">
          <Timer
            durations={durations}
            longBreakInterval={longBreakInterval}
            autoSwitchEnabled={autoSwitchEnabled}
            onOpenSettings={() => setSettingsOpen(true)}
          />
          <div className="scroll-guide">Scroll down to manage your tasks</div>
        </section>
        <section className="page-screen">
          <TodoList />
        </section>
        <Footer />
      </main>

      {settingsOpen && (
        <Settings
          durations={durations}
          longBreakInterval={longBreakInterval}
          autoSwitchEnabled={autoSwitchEnabled}
          onSave={handleSave}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
