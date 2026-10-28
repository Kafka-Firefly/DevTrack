import { useEffect, useMemo, useState } from 'react'

const PROJECTS_URL = '/api/projects/'
const TASKS_URL = '/api/tasks/'
const STATUSES = [
  { value: 'todo', label: 'To do', color: 'todo' },
  { value: 'in_progress', label: 'In progress', color: 'progress' },
  { value: 'done', label: 'Done', color: 'done' },
]

function localDate(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function displayDate(value) {
  const date = localDate(value)
  return date ? date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' }) : 'No date'
}

function DashboardTask({ task }) {
  return (
    <div className="dashboard-task">
      <span className={`dashboard-task-mark ${task.status}`} aria-hidden="true">{task.status === 'done' ? '✓' : ''}</span>
      <div className="dashboard-task-copy"><strong>{task.title}</strong><span>{task.project_name}</span></div>
      <span className="dashboard-task-date">{displayDate(task.due_date)}</span>
    </div>
  )
}

export default function DashboardView({ onOpenProjects, onOpenTasks }) {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      fetch(PROJECTS_URL, { signal: controller.signal }),
      fetch(TASKS_URL, { signal: controller.signal }),
    ])
      .then(async ([projectResponse, taskResponse]) => {
        if (!projectResponse.ok || !taskResponse.ok) throw new Error('Could not load your workspace summary.')
        return Promise.all([projectResponse.json(), taskResponse.json()])
      })
      .then(([projectData, taskData]) => {
        setProjects(projectData)
        setTasks(taskData)
      })
      .catch((loadError) => {
        if (loadError.name !== 'AbortError') setError('Could not connect to the API. Make sure the Django server is running, then try again.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const summary = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAhead = new Date(today)
    weekAhead.setDate(weekAhead.getDate() + 7)
    const open = tasks.filter((task) => task.status !== 'done')
    const done = tasks.length - open.length
    const overdue = open.filter((task) => {
      const due = localDate(task.due_date)
      return due && due < today
    })
    const upcoming = open
      .filter((task) => {
        const due = localDate(task.due_date)
        return due && due >= today && due <= weekAhead
      })
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
    const counts = Object.fromEntries(STATUSES.map(({ value }) => [value, tasks.filter((task) => task.status === value).length]))
    return { open, done, overdue, upcoming, counts, completion: tasks.length ? Math.round((done / tasks.length) * 100) : 0 }
  }, [tasks])

  const projectProgress = useMemo(() => projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.project === project.id)
    const completed = projectTasks.filter((task) => task.status === 'done').length
    return {
      ...project,
      taskCount: projectTasks.length,
      completed,
      completion: projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0,
    }
  }), [projects, tasks])

  return (
    <div className="page-content dashboard-content">
      <div className="page-heading-row dashboard-heading">
        <div><div className="eyebrow page-eyebrow">YOUR WORKSPACE</div><h1>Overview</h1><p className="page-subtitle">A clear view of what’s moving and what’s next.</p></div>
        <button className="button button-primary create-button" type="button" onClick={onOpenTasks}><span aria-hidden="true">＋</span> View tasks</button>
      </div>

      {loading ? (
        <div className="state-panel"><span className="loading-spinner" />Loading your overview…</div>
      ) : error ? (
        <div className="state-panel error-panel"><span className="state-icon">!</span><strong>We couldn’t load your overview</strong><p>{error}</p><button className="button button-secondary" type="button" onClick={() => window.location.reload()}>Try again</button></div>
      ) : (
        <>
          <section className="dashboard-stats" aria-label="Workspace summary">
            <article className="dashboard-stat"><span className="dashboard-stat-icon stat-purple">P</span><span className="dashboard-stat-label">Projects</span><strong>{projects.length}</strong><small>in your workspace</small></article>
            <article className="dashboard-stat"><span className="dashboard-stat-icon stat-blue">↗</span><span className="dashboard-stat-label">Open tasks</span><strong>{summary.open.length}</strong><small>ready for your attention</small></article>
            <article className="dashboard-stat"><span className="dashboard-stat-icon stat-green">✓</span><span className="dashboard-stat-label">Completed</span><strong>{summary.done}</strong><small>{summary.completion}% of all tasks</small></article>
            <article className="dashboard-stat"><span className="dashboard-stat-icon stat-amber">!</span><span className="dashboard-stat-label">Overdue</span><strong>{summary.overdue.length}</strong><small>open tasks past their due date</small></article>
          </section>

          <section className="dashboard-panels">
            <article className="dashboard-panel">
              <div className="dashboard-panel-heading"><div><h2>Task progress</h2><p>How work is distributed across statuses.</p></div><button className="text-button" type="button" onClick={onOpenTasks}>View tasks <span aria-hidden="true">→</span></button></div>
              {tasks.length ? <div className="status-breakdown">
                {STATUSES.map((status) => {
                  const count = summary.counts[status.value]
                  const percent = Math.round((count / tasks.length) * 100)
                  return <div className="status-breakdown-row" key={status.value}>
                    <div className="status-breakdown-label"><span className={`status-legend ${status.color}`} />{status.label}<strong>{count}</strong></div>
                    <div className="status-track" role="progressbar" aria-label={`${status.label} tasks`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent}><span className={`status-fill ${status.color}`} style={{ width: `${percent}%` }} /></div>
                    <small>{percent}%</small>
                  </div>
                })}
              </div> : <div className="dashboard-empty-inline"><span className="empty-icon">✓</span><div><strong>No tasks yet</strong><p>Create a task to see progress here.</p></div></div>}
            </article>

            <article className="dashboard-panel">
              <div className="dashboard-panel-heading"><div><h2>Coming up</h2><p>Open tasks due in the next 7 days.</p></div><button className="text-button" type="button" onClick={onOpenTasks}>All tasks <span aria-hidden="true">→</span></button></div>
              {summary.upcoming.length ? <div className="dashboard-task-list">{summary.upcoming.slice(0, 4).map((task) => <DashboardTask key={task.id} task={task} />)}</div> : <div className="dashboard-empty-inline"><span className="empty-icon">◷</span><div><strong>No upcoming deadlines</strong><p>Tasks with due dates in the next week will show here.</p></div></div>}
            </article>
          </section>

          <section className="dashboard-project-section">
            <div className="dashboard-section-heading"><div><h2>Project progress</h2><p>Completion is based on each project’s finished tasks.</p></div><button className="text-button" type="button" onClick={onOpenProjects}>All projects <span aria-hidden="true">→</span></button></div>
            {projectProgress.length ? <div className="dashboard-project-grid">{projectProgress.map((project, index) => <article className="dashboard-project-card" key={project.id}>
              <div className="dashboard-project-top"><span className={`project-mark ${['violet', 'blue', 'mint', 'amber'][index % 4]}`}>{project.name.trim().charAt(0).toUpperCase()}</span><span className="project-percent">{project.completion}%</span></div>
              <h3>{project.name}</h3><p>{project.taskCount ? `${project.completed} of ${project.taskCount} tasks complete` : 'No tasks added yet'}</p>
              <div className="project-progress-track" role="progressbar" aria-label={`${project.name} completion`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={project.completion}><span style={{ width: `${project.completion}%` }} /></div>
            </article>)}</div> : <div className="dashboard-empty-projects"><div className="empty-icon">⌂</div><div><strong>Your project overview starts here</strong><p>Create a project and add its tasks to see progress.</p></div><button className="button button-secondary" type="button" onClick={onOpenProjects}>Create a project</button></div>}
          </section>

          <footer className="page-footer"><span>DevTrack</span><span>Numbers reflect your saved projects and tasks</span></footer>
        </>
      )}
    </div>
  )
}
