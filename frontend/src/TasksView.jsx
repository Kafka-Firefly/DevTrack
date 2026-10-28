import { useEffect, useMemo, useState } from 'react'

const TASKS_URL = '/api/tasks/'
const PROJECTS_URL = '/api/projects/'
const STATUS_OPTIONS = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]
const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

function formatDate(value) {
  if (!value) return 'No due date'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function TaskDialog({ task, projects, onClose, onSave }) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [projectId, setProjectId] = useState(task ? String(task.project) : String(projects[0]?.id ?? ''))
  const [priority, setPriority] = useState(task?.priority ?? 'medium')
  const [status, setStatus] = useState(task?.status ?? 'todo')
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!projectId && projects.length) setProjectId(String(projects[0].id))
  }, [projectId, projects])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        project: Number(projectId),
        priority,
        status,
        due_date: dueDate || null,
      })
      onClose()
    } catch (saveError) {
      setError(saveError.message || 'Could not save this task. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="task-dialog-title">
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">{task ? 'EDIT TASK' : 'NEW TASK'}</span>
            <h2 id="task-dialog-title">{task ? 'Edit task' : 'Create a task'}</h2>
            <p>{task ? 'Update the details or status of this task.' : 'Break a project into a clear next step.'}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="task-title">Task name <span>Required</span></label>
          <input id="task-title" autoFocus maxLength="160" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Sketch the dashboard layout" />

          <label className="field-label" htmlFor="task-project">Project <span>Required</span></label>
          <select id="task-project" required value={projectId} onChange={(event) => setProjectId(event.target.value)}>
            <option value="" disabled>Select a project</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>

          <div className="task-form-row">
            <div>
              <label className="field-label" htmlFor="task-priority">Priority</label>
              <select id="task-priority" value={priority} onChange={(event) => setPriority(event.target.value)}>
                {PRIORITIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="task-date">Due date <span>Optional</span></label>
              <input id="task-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </div>
          </div>

          <label className="field-label" htmlFor="task-description">Description <span>Optional</span></label>
          <textarea id="task-description" rows="3" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a few helpful details" />

          {task && <><label className="field-label" htmlFor="task-status">Status</label><select id="task-status" value={status} onChange={(event) => setStatus(event.target.value)}>{STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="dialog-actions">
            <button className="button button-secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="button button-primary" type="submit" disabled={saving || !title.trim() || !projectId}>{saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function TaskRow({ task, onEdit, onDelete, onStatusChange }) {
  const statusLabel = STATUS_OPTIONS.find((item) => item.value === task.status)?.label ?? task.status
  return (
    <article className={`task-row${task.status === 'done' ? ' task-row-done' : ''}`}>
      <div className={`task-check${task.status === 'done' ? ' checked' : ''}`} aria-hidden="true">{task.status === 'done' ? '✓' : ''}</div>
      <div className="task-main">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        <div className="task-meta">
          <span className="task-project"><span className="task-project-dot" />{task.project_name}</span>
          <span className="task-meta-divider" />
          <span>{formatDate(task.due_date)}</span>
        </div>
      </div>
      <span className={`priority-pill priority-${task.priority}`}>{task.priority}</span>
      <label className="status-select-wrap">
        <span className="sr-only">Status for {task.title}</span>
        <select className={`status-select status-${task.status}`} value={task.status} onChange={(event) => onStatusChange(task, event.target.value)} aria-label={`Status for ${task.title}`}>
          {STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
      <div className="task-row-actions">
        <button className="card-action" type="button" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`} title="Edit task">✎</button>
        <button className="card-action delete-action" type="button" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`} title="Delete task">×</button>
      </div>
      <span className="sr-only">Current status: {statusLabel}</span>
    </article>
  )
}

export default function TasksView({ onOpenProjects }) {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [filter, setFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      fetch(TASKS_URL, { signal: controller.signal }),
      fetch(PROJECTS_URL, { signal: controller.signal }),
    ])
      .then(async ([taskResponse, projectResponse]) => {
        if (!taskResponse.ok || !projectResponse.ok) throw new Error('Could not load tasks and projects.')
        return Promise.all([taskResponse.json(), projectResponse.json()])
      })
      .then(([taskData, projectData]) => {
        setTasks(taskData)
        setProjects(projectData)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setLoadError('Could not connect to the API. Make sure the Django server is running, then try again.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const filteredTasks = useMemo(() => filter === 'all' ? tasks : tasks.filter((task) => task.status === filter), [filter, tasks])
  const openCount = tasks.filter((task) => task.status !== 'done').length
  const doneCount = tasks.length - openCount

  async function saveTask(data) {
    const url = editingTask ? `${TASKS_URL}${editingTask.id}/` : TASKS_URL
    const response = await fetch(url, {
      method: editingTask ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.title?.[0] || result.project?.[0] || result.detail || 'Please check the task details and try again.')
    setTasks((current) => editingTask ? current.map((item) => item.id === result.id ? result : item) : [result, ...current])
    setActionError('')
  }

  async function changeStatus(task, status) {
    try {
      const response = await fetch(`${TASKS_URL}${task.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error('The task status could not be updated.')
      setTasks((current) => current.map((item) => item.id === result.id ? result : item))
      setActionError('')
    } catch (error) {
      setActionError(error.message || 'The task status could not be updated.')
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete task “${task.title}”? This action cannot be undone.`)) return
    try {
      const response = await fetch(`${TASKS_URL}${task.id}/`, { method: 'DELETE' })
      if (!response.ok) throw new Error('The task could not be deleted. Please try again.')
      setTasks((current) => current.filter((item) => item.id !== task.id))
      setActionError('')
    } catch (error) {
      setActionError(error.message || 'The task could not be deleted. Please try again.')
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading-row">
        <div><div className="eyebrow page-eyebrow">YOUR WORKSPACE</div><h1>Tasks</h1><p className="page-subtitle">Turn project plans into clear next steps.</p></div>
        <button className="button button-primary create-button" type="button" onClick={() => { setEditingTask(null); setDialogOpen(true) }} disabled={!projects.length}><span aria-hidden="true">＋</span> New task</button>
      </div>

      <section className="summary-panel task-summary" aria-label="Task summary">
        <div className="summary-icon task-summary-icon"><span aria-hidden="true">✓</span></div>
        <div className="summary-copy"><span>Tasks to work on</span><strong>{openCount}</strong></div>
        <div className="summary-separator" />
        <div className="summary-copy"><span>Completed</span><strong>{doneCount}</strong></div>
        <div className="summary-message"><span className="summary-spark">✦</span><span>One step at a time.</span></div>
        <div className="summary-decoration decoration-one" /><div className="summary-decoration decoration-two" />
      </section>

      <div className="task-toolbar">
        <div className="section-heading-row task-heading"><div><h2>All tasks</h2><span className="section-count">{tasks.length}</span></div></div>
        <div className="task-filters" role="group" aria-label="Filter tasks by status">
          {[{ value: 'all', label: 'All' }, ...STATUS_OPTIONS].map((item) => <button key={item.value} className={`task-filter${filter === item.value ? ' active' : ''}`} type="button" onClick={() => setFilter(item.value)}>{item.label}{item.value === 'all' && <span>{tasks.length}</span>}</button>)}
        </div>
      </div>

      {actionError && <p className="action-error" role="alert">{actionError}</p>}
      {loading ? (
        <div className="state-panel"><span className="loading-spinner" />Loading your tasks…</div>
      ) : loadError ? (
        <div className="state-panel error-panel"><span className="state-icon">!</span><strong>We couldn’t reach your workspace</strong><p>{loadError}</p><button className="button button-secondary" type="button" onClick={() => window.location.reload()}>Try again</button></div>
      ) : !projects.length ? (
        <div className="state-panel empty-panel"><div className="empty-icon">⌂</div><strong>Create a project first</strong><p>Tasks belong to a project, so set up a project before adding its tasks.</p><button className="button button-secondary" type="button" onClick={onOpenProjects}>Go to projects</button></div>
      ) : filteredTasks.length ? (
        <div className="task-list">{filteredTasks.map((task) => <TaskRow key={task.id} task={task} onEdit={(item) => { setEditingTask(item); setDialogOpen(true) }} onDelete={deleteTask} onStatusChange={changeStatus} />)}</div>
      ) : filter !== 'all' ? (
        <div className="state-panel empty-panel"><div className="empty-icon">✓</div><strong>No {STATUS_OPTIONS.find((item) => item.value === filter)?.label.toLowerCase()} tasks</strong><p>Tasks with this status will appear here.</p></div>
      ) : (
        <div className="state-panel empty-panel"><div className="empty-icon">✓</div><strong>Your task list is clear</strong><p>Add a task to break your project into manageable steps.</p><button className="button button-secondary" type="button" onClick={() => { setEditingTask(null); setDialogOpen(true) }}>＋ Create a task</button></div>
      )}

      <footer className="page-footer"><span>DevTrack</span><span>Built for thoughtful progress</span></footer>
      {dialogOpen && <TaskDialog task={editingTask} projects={projects} onClose={() => setDialogOpen(false)} onSave={saveTask} />}
    </div>
  )
}
