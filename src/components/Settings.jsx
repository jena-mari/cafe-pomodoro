import React, { useState } from 'react'

const themes = [
  { key: 'coffee',      label: 'coffee',        img: '/components/coffee.png' },
  { key: 'matcha',      label: 'matcha',        img: '/components/matcha.png' },
  { key: 'choco-berry', label: 'choco berry',   img: '/components/choco-berry.png' },
  { key: 'blue-lemon',  label: 'blue lemonade', img: '/components/blue-lemon.png' },
  { key: 'ube',         label: 'ube',           img: '/components/ube.png' },
]

export default function Settings({ durations, onSave, onClose }) {
  const [localDurations, setLocalDurations] = useState({ ...durations })
  const [selectedTheme, setSelectedTheme] = useState(
    () => localStorage.getItem('selectedTheme') || 'coffee'
  )

  const handleDurationChange = (key, value) => {
    setLocalDurations(prev => ({ ...prev, [key]: Number(value) || 0 }))
  }

  const handleReset = () => {
    setLocalDurations({ Pomodoro: 25, 'Short Break': 5, 'Long Break': 15 })
    setSelectedTheme('coffee')
  }

  const handleSave = () => {
    localStorage.setItem('selectedTheme', selectedTheme)
    onSave({ durations: localDurations, theme: selectedTheme })
  }

  return (
    <>
      <style>{`
        .s-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(6px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .s-panel {
          background: var(--card);
          border: 2.5px solid var(--accent);
          border-radius: 2rem;
          padding: 2.25rem 2.5rem 2rem;
          width: min(100%, 32rem);
          position: relative;
          animation: settingsFadeIn 0.22s ease;
          max-height: 90vh;
          overflow-y: auto;
        }

        @keyframes settingsFadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .s-close {
          position: absolute;
          top: 1rem;
          right: 1.25rem;
          background: none;
          border: none;
          font-family: 'Urbanist', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--accent);
          cursor: pointer;
          padding: 0.25rem 0.4rem;
          line-height: 1;
          opacity: 0.7;
          transition: opacity 150ms ease;
          box-shadow: none !important;
        }
        .s-close:hover { opacity: 1; transform: none; }

        .s-heading {
          font-family: 'Denton Condensed', serif;
          font-weight: 700;
          font-size: 2.4rem;
          color: var(--accent);
          margin: 0 0 1.25rem;
          line-height: 1;
        }

        .s-subheading {
          font-family: 'Denton Condensed', serif;
          font-weight: 700;
          font-size: 1.8rem;
          color: var(--accent);
          margin: 1.25rem 0 0.75rem;
          line-height: 1;
        }

        /* 5-column grid so all mugs stay on one row */
        .s-themes {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
        }

        .s-theme-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0.25rem 0;
          box-shadow: none !important;
        }

        .s-theme-img-wrap {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 0.875rem;
          overflow: hidden;
          border: 2.5px solid transparent;
          transition: border-color 150ms ease, transform 150ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .s-theme-item.active .s-theme-img-wrap {
          border-color: var(--accent);
        }
        .s-theme-item:hover .s-theme-img-wrap {
          transform: translateY(-2px);
        }
        /* prevent global hover from interfering */
        .s-theme-item:hover { transform: none; }

        .s-theme-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .s-theme-label {
          font-family: 'Urbanist', sans-serif;
          font-size: 0.7rem;
          color: var(--accent);
          text-align: center;
          line-height: 1.2;
        }

        .s-timer-rows {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .s-timer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .s-timer-label {
          font-family: 'Urbanist', sans-serif;
          font-size: 0.9rem;
          color: var(--accent);
        }

        .s-timer-input {
          width: 5.5rem;
          border: 2px solid var(--accent);
          border-radius: 999px;
          padding: 0.45rem 0.75rem;
          font-family: 'Urbanist', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--accent);
          background: var(--card);
          text-align: center;
          appearance: auto;
          outline: none;
          box-shadow: none !important;
        }

        .s-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.5rem;
          gap: 1rem;
        }

        .s-btn {
          border: none;
          border-radius: 999px;
          padding: 0.7rem 1.5rem;
          font-family: 'Urbanist', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: none !important;
          transition: transform 150ms ease, opacity 150ms ease;
        }
        .s-btn:hover { transform: translateY(-1px); opacity: 0.9; }

        .s-btn-reset { background: #b52a2a; color: #f5ede6; }
        .s-btn-save  { background: var(--accent); color: var(--card); }
      `}</style>

      <div className="s-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
        <div className="s-panel" role="dialog" aria-modal="true" aria-label="Settings">

          <button className="s-close" onClick={onClose} aria-label="Close settings">x</button>

          <h2 className="s-heading">Settings</h2>

          <div className="s-themes">
            {themes.map(theme => (
              <button
                key={theme.key}
                type="button"
                className={`s-theme-item${selectedTheme === theme.key ? ' active' : ''}`}
                onClick={() => setSelectedTheme(theme.key)}
                aria-label={`Select ${theme.label} theme`}
                aria-pressed={selectedTheme === theme.key}
              >
                <div className="s-theme-img-wrap">
                  <img src={theme.img} alt={theme.label} draggable={false} />
                </div>
                <span className="s-theme-label">{theme.label}</span>
              </button>
            ))}
          </div>

          <h3 className="s-subheading">Timer</h3>

          <div className="s-timer-rows">
            {[
              { label: 'pomodoro',    key: 'Pomodoro' },
              { label: 'short break', key: 'Short Break' },
              { label: 'long break',  key: 'Long Break' },
            ].map(({ label, key }) => (
              <div className="s-timer-row" key={key}>
                <span className="s-timer-label">{label}</span>
                <input
                  type="number"
                  className="s-timer-input"
                  min="1"
                  max="120"
                  value={localDurations[key] ?? 25}
                  onChange={e => handleDurationChange(key, e.target.value)}
                  aria-label={`${label} duration in minutes`}
                />
              </div>
            ))}
          </div>

          <div className="s-actions">
            <button type="button" className="s-btn s-btn-reset" onClick={handleReset}>reset all</button>
            <button type="button" className="s-btn s-btn-save" onClick={handleSave}>save changes</button>
          </div>

        </div>
      </div>
    </>
  )
}
