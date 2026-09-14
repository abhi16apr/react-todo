import { useEffect, useMemo, useRef, useState } from 'react'

const STORAGE_KEY = 'react-todo.items'

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatDue(due) {
  const d = new Date(due + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [text, setText] = useState('')
  const [tag, setTag] = useState('')
  const [due, setDue] = useState('')
  const [filter, setFilter] = useState('all') // all | active | done
  const [tagFilter, setTagFilter] = useState(null)
  const [sort, setSort] = useState('manual') // manual | due
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const dragId = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
      // ignore write failures (e.g. private mode)
    }
  }, [todos])

  function addTodo(e) {
    e.preventDefault()
    const title = text.trim()
    if (!title) return
    setTodos((prev) => [
      { id: crypto.randomUUID(), title, done: false, tag: tag.trim(), due },
      ...prev,
    ])
    setText('')
    setTag('')
    setDue('')
  }

  function toggle(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    )
  }

  function remove(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  function clearDone() {
    setTodos((prev) => prev.filter((t) => !t.done))
  }

  // --- inline editing ---
  function startEdit(t) {
    setEditingId(t.id)
    setEditText(t.title)
  }

  function commitEdit() {
    const title = editText.trim()
    if (title) {
      setTodos((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, title } : t)),
      )
    }
    setEditingId(null)
    setEditText('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditText('')
  }

  // --- drag to reorder (operates on the full list by id) ---
  function onDrop(overId) {
    const from = dragId.current
    dragId.current = null
    if (!from || from === overId) return
    setTodos((prev) => {
      const items = [...prev]
      const fromIdx = items.findIndex((t) => t.id === from)
      const overIdx = items.findIndex((t) => t.id === overId)
      if (fromIdx === -1 || overIdx === -1) return prev
      const [moved] = items.splice(fromIdx, 1)
      items.splice(overIdx, 0, moved)
      return items
    })
  }

  const tags = useMemo(
    () => [...new Set(todos.map((t) => t.tag).filter(Boolean))].sort(),
    [todos],
  )

  const visible = useMemo(() => {
    let items = todos.filter((t) => {
      if (filter === 'active' && t.done) return false
      if (filter === 'done' && !t.done) return false
      if (tagFilter && t.tag !== tagFilter) return false
      return true
    })
    if (sort === 'due') {
      // tasks with a due date first (earliest first), undated last
      items = [...items].sort((a, b) => {
        if (!a.due && !b.due) return 0
        if (!a.due) return 1
        if (!b.due) return -1
        return a.due.localeCompare(b.due)
      })
    }
    return items
  }, [todos, filter, tagFilter, sort])

  const remaining = todos.filter((t) => !t.done).length
  const today = todayStr()
  const canDrag = !tagFilter && filter === 'all' && sort === 'manual'

  return (
    <div className="app">
      <h1>To-Do</h1>

      <form className="add" onSubmit={addTodo}>
        <input
          className="add-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs doing?"
          aria-label="New task"
        />
        <div className="add-meta">
          <input
            className="add-tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="tag (optional)"
            aria-label="Tag"
          />
          <input
            className="add-due"
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            aria-label="Due date"
          />
          <button type="submit">Add</button>
        </div>
      </form>

      {todos.length > 0 && (
        <div className="toolbar">
          <div className="filters">
            {['all', 'active', 'done'].map((f) => (
              <button
                key={f}
                className={filter === f ? 'active' : ''}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="toolbar-right">
            <button
              className={`sort ${sort === 'due' ? 'active' : ''}`}
              onClick={() => setSort(sort === 'due' ? 'manual' : 'due')}
              title="Sort by due date"
            >
              {sort === 'due' ? '↑ due date' : 'sort by due'}
            </button>
            <span className="count">{remaining} left</span>
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="tags-bar">
          <button
            className={tagFilter === null ? 'active' : ''}
            onClick={() => setTagFilter(null)}
          >
            all tags
          </button>
          {tags.map((tg) => (
            <button
              key={tg}
              className={tagFilter === tg ? 'active' : ''}
              onClick={() => setTagFilter(tagFilter === tg ? null : tg)}
            >
              {tg}
            </button>
          ))}
        </div>
      )}

      <ul className="list">
        {visible.map((t) => {
          const overdue = t.due && !t.done && t.due < today
          const editing = editingId === t.id
          return (
            <li
              key={t.id}
              className={`${t.done ? 'done' : ''} ${canDrag ? 'draggable' : ''}`}
              draggable={canDrag && !editing}
              onDragStart={() => (dragId.current = t.id)}
              onDragOver={(e) => canDrag && e.preventDefault()}
              onDrop={() => canDrag && onDrop(t.id)}
            >
              {canDrag && <span className="handle" aria-hidden>⠿</span>}
              {editing ? (
                <input
                  className="edit-input"
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  aria-label="Edit task"
                />
              ) : (
                <label>
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => toggle(t.id)}
                  />
                  <span
                    className="title"
                    onDoubleClick={() => startEdit(t)}
                    title="Double-click to edit"
                  >
                    {t.title}
                  </span>
                </label>
              )}
              {!editing && (
                <div className="badges">
                  {t.tag && <span className="chip">{t.tag}</span>}
                  {t.due && (
                    <span className={`due ${overdue ? 'overdue' : ''}`}>
                      {formatDue(t.due)}
                    </span>
                  )}
                  <button
                    className="del"
                    onClick={() => remove(t.id)}
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {todos.length === 0 && (
        <p className="empty">Nothing yet. Add your first task above.</p>
      )}
      {todos.length > 0 && visible.length === 0 && (
        <p className="empty">No tasks match this filter.</p>
      )}

      {todos.some((t) => t.done) && (
        <button className="clear" onClick={clearDone}>
          Clear completed
        </button>
      )}
    </div>
  )
}
