import React, { useState } from 'react'
import Timer from './components/Timer'
import TodoList from './components/TodoList'

const themes = ['coffee','matcha','choco-berry','blue-lemon','ube']

export default function App(){
  const [theme, setTheme] = useState('coffee')

  return (
    <div className={`theme-${theme} min-h-screen flex items-center justify-center p-6 bg-[color:var(--bg)] text-[color:var(--text)]`}>
      <div className={`max-w-3xl w-full space-y-8 p-8 rounded-2xl bg-[color:var(--card)] shadow-lg`}>
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={`/components/${theme}.png`} alt="logo" className="w-10 h-10 rounded-full" />
            <h1 className="text-2xl font-bold">Cafe Pomodoro</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm">Theme</label>
            <select value={theme} onChange={e=>setTheme(e.target.value)} className="px-3 py-1 rounded-md bg-[color:var(--muted)] text-[color:var(--text)]">
              {themes.map(t=> <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-6">
          <Timer />
          <TodoList />
        </main>
      </div>
    </div>
  )
}
