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
  const [theme, setTheme] = useState('coffee')
  const [durations, setDurations] = useState(defaultDurations)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Restore persisted settings on mount
  useEffect(() => {
    const saved = loadSettings()
    if (saved) {
      setTheme(saved.theme || 'coffee')
      setDurations(saved.durations || defaultDurations)
    }
  }, [])

  // Persist whenever settings change
  useEffect(() => {
    localStorage.setItem('cafe-settings', JSON.stringify({ theme, durations }))
  }, [theme, durations])

  // Apply theme class to <html> so all CSS variable rules in styles.css take effect
  useEffect(() => {
    // Remove any previous theme class
    document.documentElement.classList.forEach(cls => {
      if (cls.startsWith('theme-')) document.documentElement.classList.remove(cls)
    })
    document.documentElement.classList.add(`theme-${theme}`)
  }, [theme])

  const handleSave = ({ durations: newDurations, theme: newTheme }) => {
    setDurations(newDurations)
    setTheme(newTheme)
    setSettingsOpen(false)
  }

  return (
    <div className="app-root">
      <main className="page-container">
        <section className="page-screen">
          <Timer durations={durations} onOpenSettings={() => setSettingsOpen(true)} />
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
          onSave={handleSave}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
