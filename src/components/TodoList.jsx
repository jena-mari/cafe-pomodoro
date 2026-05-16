import React, { useEffect, useMemo, useState } from 'react'

const statusOptions = ['in progress', 'done']

export default function TodoList() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cafe-todos') || '[]')
    } catch {
      return []
    }
  })
  const [status, setStatus] = useState('in progress')
  const [text, setText] = useState('')
  const [intervals, setIntervals] = useState('')

  useEffect(() => {
    localStorage.setItem('cafe-todos', JSON.stringify(items))
  }, [items])

  const add = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setItems(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        status,
        text: trimmed,
        intervals: intervals === '' ? '' : Number(intervals),
        completed: status === 'done',
      },
    ])
    setText('')
    setIntervals('')
    setStatus('in progress')
  }

  const updateItem = (id, changes) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item
        const updated = { ...item, ...changes }
        if ('status' in changes) updated.completed = changes.status === 'done'
        return updated
      })
    )
  }

  const remove = id => setItems(prev => prev.filter(item => item.id !== id))

  const stats = useMemo(() => {
    const completed = items.filter(i => i.completed).length
    return { total: items.length, completed }
  }, [items])

  return (
    <>
      <style>{`
        .todo-row {
          display: grid;
          grid-template-columns: minmax(8rem, 10rem) minmax(0, 1fr) minmax(7rem, 8.5rem) 3rem;
          gap: 0.75rem;
          align-items: center;
        }

        @media (max-width: 640px) {
          .todo-row { grid-template-columns: 1fr; }
        }

        /* "done" state: invert colours, no strikethrough */
        .todo-input-done {
          background: var(--accent) !important;
          color: var(--card) !important;
          opacity: 0.75;
        }

        /*
          Interval field:
          - "intervals" label sits on the LEFT, before the number
          - spinner arrows sit on the far right (browser default position)
          - no overlap
        */
        .interval-wrap {
          display: flex;
          align-items: center;
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 1.5rem;
          background: var(--card);
          overflow: hidden;
          transition: border-color 180ms ease, transform 180ms ease;
        }
        .interval-wrap:focus-within {
          outline: none;
        }
        .interval-wrap:hover {
          transform: translateY(-1px);
        }

        .interval-label {
          font-family: 'Urbanist', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--accent);
          opacity: 0.45;
          letter-spacing: 0.04em;
          text-transform: lowercase;
          white-space: nowrap;
          padding-left: 1rem;
          pointer-events: none;
          flex-shrink: 0;
          user-select: none;
        }

        .interval-input {
          /* take remaining space; spinner stays at far right */
          flex: 1;
          min-width: 0;
          border: none;
          background: transparent;
          color: var(--accent);
          font-family: 'Urbanist', sans-serif;
          font-size: 0.9rem;
          padding: 0.95rem 0.6rem 0.95rem 0.4rem;
          text-align: right;
          outline: none;
          box-shadow: none !important;
        }

        .todo-add-divider {
          height: 1px;
          background: rgba(0,0,0,0.08);
          margin: 0.25rem 0;
        }

        .todo-add-row .todo-input,
        .todo-add-row .interval-wrap {
          background: var(--muted);
        }
        .todo-add-row .interval-wrap {
          border-color: rgba(0,0,0,0.08);
        }
        .todo-add-row .interval-input {
          background: transparent;
        }

        .trash-btn {
          width: 3rem;
          height: 3rem;
          border-radius: 999px;
          background: rgba(0,0,0,0.07);
          color: var(--accent);
          border: 1px solid rgba(0,0,0,0.1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 150ms ease, transform 150ms ease;
          box-shadow: none !important;
          flex-shrink: 0;
        }
        .trash-btn:hover {
          background: rgba(0,0,0,0.13);
          transform: translateY(-1px);
        }
      `}</style>

      <section className="todo-card" aria-label="To-do list">
        <div className="todo-header">
          <h2 className="todo-title">Your To-Do List</h2>
          {items.length > 0 && (
            <span className="todo-count">{stats.completed}/{stats.total} done</span>
          )}
        </div>

        {items.length > 0 && (
          <div className="todo-items">
            {items.map(item => (
              <div key={item.id} className="todo-row">
                <select
                  className="custom-select"
                  value={item.status}
                  onChange={e => updateItem(item.id, { status: e.target.value })}
                >
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                <input
                  type="text"
                  className={`todo-input${item.completed ? ' todo-input-done' : ''}`}
                  value={item.text}
                  onChange={e => updateItem(item.id, { text: e.target.value })}
                  placeholder="task name..."
                  aria-label="Task name"
                />

                {/* label LEFT · number + spinner RIGHT */}
                <div className="interval-wrap">
                  <span className="interval-label">intervals</span>
                  <input
                    type="number"
                    className="interval-input"
                    min="0"
                    value={item.intervals}
                    onChange={e =>
                      updateItem(item.id, {
                        intervals: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    aria-label="Number of intervals"
                    placeholder="0"
                  />
                </div>

                <button
                  type="button"
                  className="trash-btn"
                  onClick={() => remove(item.id)}
                  aria-label="Delete task"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M7 7V18C7 19.1046 7.89543 20 9 20H15C16.1046 20 17 19.1046 17 18V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 11V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M14 11V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M5 7H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M9 7V5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && <div className="todo-add-divider" />}

        <div className="todo-row todo-add-row">
          <select
            className="custom-select"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add() }}
            placeholder="task name..."
            aria-label="New task name"
            className="todo-input"
          />

          <div className="interval-wrap">
            <span className="interval-label">intervals</span>
            <input
              type="number"
              className="interval-input"
              min="0"
              value={intervals}
              onChange={e => setIntervals(e.target.value === '' ? '' : Number(e.target.value))}
              aria-label="Number of intervals"
              placeholder="0"
            />
          </div>

          <div aria-hidden="true" style={{ width: '3rem' }} />
        </div>

        <button type="button" onClick={add} className="btn btn-accent btn-block">
          + add task
        </button>
      </section>
    </>
  )
}