import React, { useState, useEffect } from 'react'

export default function TodoList(){
  const [items, setItems] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem('cafe-todos')||'[]') }catch{ return [] }
  })
  const [text, setText] = useState('')

  useEffect(()=>{
    localStorage.setItem('cafe-todos', JSON.stringify(items))
  },[items])

  const add = ()=>{
    if(!text.trim()) return
    setItems(prev=>[...prev, {id:Date.now(), text:text.trim(), done:false}])
    setText('')
  }

  return (
    <section className="card" aria-label="To-do list">
      <h2 className="text-xl font-semibold mb-4">Your To-Do List</h2>
      <div className="space-y-3">
        {items.map(it=> (
          <div key={it.id} className="flex items-center gap-3">
            <input type="checkbox" checked={it.done} onChange={()=>setItems(items.map(i=> i.id===it.id? {...i, done:!i.done}:i))} />
            <div className={`${it.done? 'line-through opacity-60':''}`}>{it.text}</div>
            <button onClick={()=>setItems(items.filter(i=>i.id!==it.id))} className="ml-auto px-2 py-1 rounded-md bg-[color:var(--muted)]">Delete</button>
          </div>
        ))}

        <div className="flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add a task" aria-label="New task" className="todo-input flex-1 px-3 py-2 rounded-md" />
          <button onClick={add} className="btn btn-accent">Add</button>
        </div>
      </div>
    </section>
  )
}
