import { useEffect, useMemo, useState } from 'react'
import TasksView from './TasksView'
import './App.css'

const PROJECTS_URL = '/api/projects/'

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    folder: <><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" /><path d="M3.5 10h17" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
  }

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

function ProjectCard({ project, index, onEdit, onDelete }) {
  const colors = ['violet', 'blue', 'mint', 'amber']
  const dueDate = project.due_date
    ? new Date(`${project.due_date}T00:00:00`).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'No deadline'

  return (
    <article className="project-card">
      <div className="card-topline">
        <div className={`project-mark ${colors[index % colors.length]}`}>{project.name.trim().charAt(0).toUpperCase()}</div>
        <span className="project-type"><span className="status-dot" /> Personal project</span>
      </div>
      <h2>{project.name}</h2>
      <p className={`project-description${project.description ? '' : ' muted'}`}>
        {project.description || 'Add a short description to give this project more context.'}
      </p>
      <div className="card-divider" />
      <div className="card-footer">
        <span className="due-date"><Icon name="calendar" size={15} /> {dueDate}</span>
        <div className="card-actions">
          <button className="card-action" type="button" onClick={() => onEdit(project)} aria-label={`Edit ${project.name}`} title="Edit project"><Icon name="edit" size={15} /></button>
          <button className="card-action delete-action" type="button" onClick={() => onDelete(project)} aria-label={`Delete ${project.name}`} title="Delete project"><Icon name="trash" size={15} /></button>
        </div>
      </div>
    </article>
  )
}

function ProjectDialog({ project, onClose, onSave }) {
  const [name, setName] = useState(project?.name ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [dueDate, setDueDate] = useState(project?.due_date ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({ name: name.trim(), description: description.trim(), due_date: dueDate || null })
      onClose()
    } catch (createError) {
      setError(createError.message || 'Could not create this project. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">{project ? 'EDIT PROJECT' : 'NEW PROJECT'}</span>
            <h2 id="dialog-title">{project ? 'Edit project' : 'Create a project'}</h2>
            <p>{project ? 'Update the details for this project.' : 'Give your work a name and a place to grow.'}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="project-name">Project name <span>Required</span></label>
          <input id="project-name" autoFocus maxLength="120" required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Portfolio redesign" />

          <label className="field-label" htmlFor="project-description">Description <span>Optional</span></label>
          <textarea id="project-description" rows="3" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What are you working on?" />

          <label className="field-label" htmlFor="project-date">Target date <span>Optional</span></label>
          <input id="project-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="dialog-actions">
            <button className="button button-secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="button button-primary" type="submit" disabled={saving || !name.trim()}>
              {saving ? 'Saving…' : project ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function App() {
  const [activePage, setActivePage] = useState(() => window.location.hash === '#tasks' ? 'tasks' : 'projects')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiConnected, setApiConnected] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetch(PROJECTS_URL, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('The projects could not be loaded.')
        return response.json()
      })
      .then((data) => {
        setProjects(data)
        setApiConnected(true)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setLoadError('Could not connect to the API. Make sure the Django server is running, then try again.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return projects
    return projects.filter((project) => `${project.name} ${project.description}`.toLowerCase().includes(query))
  }, [projects, search])

  async function saveProject(projectData) {
    const url = editingProject ? `${PROJECTS_URL}${editingProject.id}/` : PROJECTS_URL
    const response = await fetch(url, {
      method: editingProject ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    })
    const result = await response.json()
    if (!response.ok) {
      const message = result.name?.[0] || result.detail || 'Please check the project details and try again.'
      throw new Error(message)
    }
    if (editingProject) {
      setProjects((current) => current.map((project) => project.id === result.id ? result : project))
    } else {
      setProjects((current) => [result, ...current])
    }
    setActionError('')
  }

  async function deleteProject(project) {
    if (!window.confirm(`Delete “${project.name}” and all its tasks? This action cannot be undone.`)) return
    try {
      const response = await fetch(`${PROJECTS_URL}${project.id}/`, { method: 'DELETE' })
      if (!response.ok) throw new Error('The project could not be deleted. Please try again.')
      setProjects((current) => current.filter((item) => item.id !== project.id))
      setActionError('')
    } catch (error) {
      setActionError(error.message || 'The project could not be deleted. Please try again.')
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#projects" aria-label="DevTrack home" onClick={() => setActivePage('projects')}>
          <span className="brand-symbol">d</span>
          <span>devtrack</span>
          <span className="brand-beta">BETA</span>
        </a>

        <div className="workspace-switcher">
          <div className="workspace-avatar">W</div>
          <div className="workspace-copy"><strong>My workspace</strong><span>Personal space</span></div>
          <span className="switcher-chevron">⌄</span>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item" href="#overview" aria-disabled="true" onClick={(event) => event.preventDefault()}>
            <Icon name="grid" /><span>Overview</span><span className="nav-soon">Soon</span>
          </a>
          <a className={`nav-item${activePage === 'projects' ? ' active' : ''}`} href="#projects" aria-current={activePage === 'projects' ? 'page' : undefined} onClick={() => setActivePage('projects')}>
            <Icon name="folder" /><span>Projects</span><span className="nav-count">{projects.length}</span>
          </a>
          <a className={`nav-item${activePage === 'tasks' ? ' active' : ''}`} href="#tasks" aria-current={activePage === 'tasks' ? 'page' : undefined} onClick={() => setActivePage('tasks')}>
            <Icon name="check" /><span>Tasks</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note-icon"><span>✦</span></div>
          <strong>A little progress<br />adds up.</strong>
          <p>Your project space is ready when you are.</p>
          <div className="sidebar-note-line"><span /></div>
          <div className="profile-row"><div className="profile-avatar">Y</div><div><strong>Your profile</strong><span>Local demo</span></div><span className="profile-menu">···</span></div>
        </div>
      </aside>

      <main className="main-content" id={activePage}>
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{activePage === 'tasks' ? 'Tasks' : 'Projects'}</strong></div>
          <div className="topbar-right"><span className={`connection-state${apiConnected ? '' : ' disconnected'}`}><span /> {apiConnected ? 'API connected' : loading ? 'Connecting' : 'API offline'}</span><div className="topbar-avatar">Y</div></div>
        </header>

        {activePage === 'projects' ? <div className="page-content">
          <div className="page-heading-row">
            <div>
              <div className="eyebrow page-eyebrow">YOUR WORKSPACE</div>
              <h1>Projects</h1>
              <p className="page-subtitle">A calm place to keep your ideas moving.</p>
            </div>
            <button className="button button-primary create-button" type="button" onClick={() => { setEditingProject(null); setDialogOpen(true) }}>
              <Icon name="plus" size={17} /> New project
            </button>
          </div>

          <section className="summary-panel" aria-label="Project summary">
            <div className="summary-icon"><Icon name="folder" size={20} /></div>
            <div className="summary-copy"><span>Projects in your workspace</span><strong>{projects.length}</strong></div>
            <div className="summary-separator" />
            <div className="summary-message"><span className="summary-spark">✦</span><span>Small steps lead to great work.</span></div>
            <div className="summary-decoration decoration-one" /><div className="summary-decoration decoration-two" />
          </section>

          <div className="section-heading-row">
            <div><h2>All projects</h2><span className="section-count">{projects.length}</span></div>
            <label className="search-box">
              <Icon name="search" size={17} />
              <input aria-label="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects" />
              <kbd>/</kbd>
            </label>
          </div>

          {actionError && <p className="action-error" role="alert">{actionError}</p>}
          {loading ? (
            <div className="state-panel"><span className="loading-spinner" />Loading your projects…</div>
          ) : loadError ? (
            <div className="state-panel error-panel"><span className="state-icon">!</span><strong>We couldn’t reach your workspace</strong><p>{loadError}</p><button className="button button-secondary" type="button" onClick={() => window.location.reload()}>Try again</button></div>
          ) : filteredProjects.length > 0 ? (
            <div className="project-grid">{filteredProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} onEdit={(item) => { setEditingProject(item); setDialogOpen(true) }} onDelete={deleteProject} />)}</div>
          ) : search ? (
            <div className="state-panel empty-panel"><div className="empty-icon"><Icon name="search" size={23} /></div><strong>No projects match “{search}”</strong><p>Try another project name or description.</p></div>
          ) : (
            <div className="state-panel empty-panel"><div className="empty-icon"><Icon name="folder" size={23} /></div><strong>Your first project starts here</strong><p>Create a project to give your work a clear home.</p><button className="button button-secondary" type="button" onClick={() => { setEditingProject(null); setDialogOpen(true) }}><Icon name="plus" size={16} /> Create a project</button></div>
          )}

          <footer className="page-footer"><span>DevTrack</span><span>Built for thoughtful progress</span></footer>
        </div> : <TasksView onOpenProjects={() => { setActivePage('projects'); window.location.hash = 'projects' }} />}
      </main>

      {dialogOpen && <ProjectDialog project={editingProject} onClose={() => setDialogOpen(false)} onSave={saveProject} />}
    </div>
  )
}

export default App
