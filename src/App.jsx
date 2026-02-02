import { useEffect, useMemo, useState } from 'react'

const EMPTY_STATE = {
  agent: 'Adrian',
  status: 'idle',
  currentFocus: 'No active focus',
  lastUpdated: '',
  tasks: [],
  activity: [],
}

const statusStyles = {
  working: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
  idle: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
  waiting: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
}

const columnColors = {
  backlog: 'border-slate-500/30',
  'in-progress': 'border-sky-500/30',
  review: 'border-amber-500/30',
  done: 'border-emerald-500/30',
}

const priorityBadge = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-blue-500/20 text-blue-300',
  high: 'bg-rose-500/20 text-rose-300',
}

const COLUMNS = [
  { key: 'backlog', title: 'Backlog', icon: '📋' },
  { key: 'in-progress', title: 'In Progress', icon: '🔨' },
  { key: 'review', title: 'Review', icon: '👀' },
  { key: 'done', title: 'Done', icon: '✅' },
]

const formatTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function App() {
  const [data, setData] = useState(EMPTY_STATE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const fetchStatus = async () => {
      try {
        const res = await fetch('/status.json', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load status')
        const json = await res.json()
        if (mounted) {
          setData({ ...EMPTY_STATE, ...json })
          setError('')
        }
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  const tasksByColumn = useMemo(() => {
    const groups = {}
    COLUMNS.forEach(c => groups[c.key] = [])
    data.tasks?.forEach(t => {
      const key = t.status || 'backlog'
      if (groups[key]) groups[key].push(t)
    })
    return groups
  }, [data.tasks])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{data.agent} Status</h1>
              <p className="mt-1 text-slate-400">Live dashboard · Auto-refreshes every 30s</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${statusStyles[data.status] || statusStyles.idle}`}>
                {data.status?.toUpperCase() || 'IDLE'}
              </span>
              <span className="text-sm text-slate-500">
                Updated: {formatTime(data.lastUpdated)}
              </span>
            </div>
          </div>
          
          {/* Current Focus */}
          <div className="mt-4 rounded-lg bg-slate-800/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Focus</p>
            <p className="mt-1 text-lg text-white">{data.currentFocus || '—'}</p>
          </div>
          
          {error && (
            <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}
          {loading && <p className="mt-4 text-slate-400">Loading...</p>}
        </header>

        {/* Kanban Board */}
        <section className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Task Board</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map(col => {
              const tasks = tasksByColumn[col.key] || []
              return (
                <div key={col.key} className={`rounded-xl border-2 ${columnColors[col.key]} bg-slate-900/50 p-4`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                      <span>{col.icon}</span>
                      <span>{col.title}</span>
                    </h3>
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-400">
                      {tasks.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {tasks.length ? tasks.map(task => (
                      <div key={task.id} className="rounded-lg bg-slate-800 p-3">
                        <p className="font-medium text-white">{task.title}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {task.priority && (
                            <span className={`rounded px-2 py-0.5 text-xs font-semibold ${priorityBadge[task.priority] || priorityBadge.medium}`}>
                              {task.priority}
                            </span>
                          )}
                          {col.key === 'review' && task.reviewBy && (
                            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300">
                              → {task.reviewBy}
                            </span>
                          )}
                        </div>
                      </div>
                    )) : (
                      <p className="py-4 text-center text-sm text-slate-600">No tasks</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Activity Log */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">Recent Activity</h2>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            {data.activity?.length ? (
              <div className="space-y-2">
                {data.activity.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-4 py-3">
                    <span className="text-slate-200">{entry.message}</span>
                    <span className="text-xs text-slate-500">{formatTime(entry.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-slate-500">No activity yet</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
