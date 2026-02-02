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
  working: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40',
  idle: 'bg-slate-500/15 text-slate-300 border-slate-400/40',
  waiting: 'bg-amber-500/15 text-amber-300 border-amber-400/40',
}

const taskStyles = {
  todo: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
  'in-progress': 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  done: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
}

const priorityStyles = {
  low: 'text-slate-400',
  medium: 'text-slate-300',
  high: 'text-rose-300',
}

const formatTimestamp = (value) => {
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
        const response = await fetch('/status.json', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Unable to load status.json')
        }
        const payload = await response.json()
        if (mounted) {
          setData({ ...EMPTY_STATE, ...payload })
          setError('')
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Something went wrong')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const statusLabel = useMemo(() => {
    if (!data.status) return 'Idle'
    return data.status.charAt(0).toUpperCase() + data.status.slice(1)
  }, [data.status])

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-900/80 p-6 shadow-lg shadow-black/20">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Adrian Status</p>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {data.agent} · Live Dashboard
              </h1>
            </div>
            <div className="flex flex-col items-start gap-1 text-sm text-slate-400 sm:items-end">
              <span>Last updated</span>
              <span className="text-slate-200">{formatTimestamp(data.lastUpdated)}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                statusStyles[data.status] || statusStyles.idle
              }`}
            >
              {statusLabel}
            </span>
            <span className="text-sm text-slate-300">
              Auto-refreshes every 30 seconds
            </span>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <section className="rounded-2xl border border-white/5 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Current Focus
            </h2>
            <p className="mt-4 text-lg font-medium text-white">
              {data.currentFocus || '—'}
            </p>
            {error && (
              <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            )}
            {loading && (
              <p className="mt-4 text-sm text-slate-400">Loading status…</p>
            )}
          </section>

          <section className="rounded-2xl border border-white/5 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Task List
            </h2>
            <div className="mt-4 space-y-3">
              {data.tasks?.length ? (
                data.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-2 rounded-xl border border-white/5 bg-slate-800/70 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white">{task.title}</h3>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          taskStyles[task.status] || taskStyles.todo
                        }`}
                      >
                        {task.status?.replace('-', ' ') || 'todo'}
                      </span>
                    </div>
                    {task.priority && (
                      <p className={`text-xs uppercase tracking-[0.2em] ${priorityStyles[task.priority] || 'text-slate-400'}`}>
                        Priority · {task.priority}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No tasks listed.</p>
              )}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-white/5 bg-slate-900 p-6 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Recent Activity
            </h2>
          </div>
          <div className="mt-4 space-y-3">
            {data.activity?.length ? (
              data.activity.map((entry, index) => (
                <div
                  key={`${entry.timestamp}-${index}`}
                  className="flex flex-col gap-1 rounded-xl border border-white/5 bg-slate-800/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm text-white">{entry.message}</p>
                  <span className="text-xs text-slate-400">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No recent activity.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
