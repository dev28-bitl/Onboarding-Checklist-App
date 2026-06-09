import { useEffect, useState } from 'react'
import ChecklistCard from '../components/ChecklistCard'
import TemplateForm from '../components/TemplateForm'
import { useAuth } from '../context/AuthContext'
import { getDevelopersRequest } from '../services/authService'
import {
  assignChecklist,
  createTemplate,
  deleteTemplate,
  getTemplates,
  getUserChecklists,
  updateTemplate,
  updateChecklistTask,
} from '../services/checklistService'
import { getProgressReport, getTeamStatusReport } from '../services/reportService'

function DashboardPage() {
  const { user, token, logout } = useAuth()
  const [checklists, setChecklists] = useState([])
  const [templates, setTemplates] = useState([])
  const [developers, setDevelopers] = useState([])
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [selectedDeveloperChecklists, setSelectedDeveloperChecklists] = useState([])
  const [reports, setReports] = useState({ progress: [], team: [] })
  const [error, setError] = useState('')

  const isManager = user?.role === 'manager' || user?.role === 'admin'
  const roleClassName = `role-${user?.role || 'developer'}`
  const roleToken = user?.role === 'admin' ? 'ADM' : user?.role === 'manager' ? 'MGR' : 'DEV'

  const statusToClassName = (status) => `status-chip status-${status || 'assigned'}`
  const formatStatus = (status) => (status || '').replace('_', ' ')

  const completedChecklists = checklists.filter((item) => item.status === 'completed').length
  const inProgressChecklists = checklists.filter((item) => item.status === 'in_progress').length
  const assignedChecklists = checklists.filter((item) => item.status === 'assigned').length
  const totalTasks = checklists.reduce((acc, checklist) => acc + checklist.tasks.length, 0)
  const completedTasks = checklists.reduce(
    (acc, checklist) => acc + checklist.tasks.filter((task) => task.completed).length,
    0,
  )
  const myCompletionPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

  useEffect(() => {
    async function loadData() {
      if (!user || !token) {
        return
      }

      try {
        const [templateData, checklistData] = await Promise.all([
          getTemplates(token),
          getUserChecklists(user.id, token),
        ])
        setTemplates(templateData)
        setChecklists(checklistData)

        if (isManager) {
          const [progress, team, developerData] = await Promise.all([
            getProgressReport(token),
            getTeamStatusReport(token),
            getDevelopersRequest(token),
          ])
          setReports({ progress, team })
          setDevelopers(developerData)
          setSelectedAssignee((prev) => prev || (developerData[0] ? String(developerData[0].id) : ''))
        }
      } catch (requestError) {
        setError(requestError.response?.data?.detail || 'Failed to load dashboard data')
      }
    }

    loadData()
  }, [user, token, isManager])

  useEffect(() => {
    async function loadSelectedDeveloperChecklists() {
      if (!isManager || !token || !selectedAssignee) {
        setSelectedDeveloperChecklists([])
        return
      }

      try {
        const checklistData = await getUserChecklists(Number(selectedAssignee), token)
        setSelectedDeveloperChecklists(checklistData)
      } catch (requestError) {
        setError(requestError.response?.data?.detail || 'Failed to load selected developer checklists')
      }
    }

    loadSelectedDeveloperChecklists()
  }, [isManager, selectedAssignee, token])

  const onToggleTask = async (task, completed) => {
    try {
      await updateChecklistTask(task.id, { completed, notes: task.notes || null }, token)
      const checklistData = await getUserChecklists(user.id, token)
      setChecklists(checklistData)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Task update failed')
    }
  }

  const onCreateTemplate = async (payload) => {
    try {
      const created = await createTemplate(payload, token)
      setTemplates((prev) => [created, ...prev])
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Template creation failed')
    }
  }

  const onAssign = async (templateId) => {
    if (!selectedAssignee) {
      setError('Please select a developer before assigning a template')
      return
    }

    try {
      await assignChecklist({ user_id: Number(selectedAssignee), template_id: templateId }, token)
      const checklistData = await getUserChecklists(user.id, token)
      const selectedChecklistData = await getUserChecklists(Number(selectedAssignee), token)
      setChecklists(checklistData)
      setSelectedDeveloperChecklists(selectedChecklistData)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Checklist assignment failed')
    }
  }

  const onEditTemplate = async (template) => {
    const title = window.prompt('Template title', template.title)
    if (title === null) {
      return
    }

    const description = window.prompt('Template description', template.description || '')
    if (description === null) {
      return
    }

    try {
      const updated = await updateTemplate(
        template.id,
        {
          title: title.trim() || template.title,
          description: description.trim(),
        },
        token,
      )
      setTemplates((prev) => prev.map((item) => (item.id === template.id ? updated : item)))
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Template update failed')
    }
  }

  const onDeleteTemplate = async (template) => {
    const confirmed = window.confirm(`Delete template \"${template.title}\"?`)
    if (!confirmed) {
      return
    }

    try {
      await deleteTemplate(template.id, token)
      setTemplates((prev) => prev.filter((item) => item.id !== template.id))
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Template deletion failed')
    }
  }

  return (
    <main className={`dashboard-shell ${roleClassName}`}>
      <header className="top-bar card">
        <div className="top-bar-left">
          <h1>Welcome, {user?.name}</h1>
          <p className="role-line">
            Role:
            {' '}
            <span className={`role-icon ${roleClassName}`}>{roleToken}</span>
            <span className={`role-badge ${roleClassName}`}>{user?.role}</span>
          </p>
        </div>
        <button onClick={logout} type="button" className="action-button">
          Logout
        </button>
      </header>

      {error && <p className="error-text">{error}</p>}

      {isManager && (
        <section className="grid-two">
          <TemplateForm onSubmit={onCreateTemplate} />
          <div className="card section-block">
            <h3>Assign From Template</h3>
            <label htmlFor="assignee-select">Assign to developer</label>
            <select
              id="assignee-select"
              value={selectedAssignee}
              onChange={(event) => setSelectedAssignee(event.target.value)}
            >
              <option value="">Select developer</option>
              {developers.map((developer) => (
                <option key={developer.id} value={developer.id}>
                  {developer.name} ({developer.email})
                </option>
              ))}
            </select>
            <div className="action-list">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onAssign(template.id)}
                  type="button"
                  className="action-button"
                >
                  Assign {template.title}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {isManager && selectedAssignee && (
        <section className="card section-block manager-checklist-section">
          <h3>Selected Developer Checklists</h3>
          <div className="manager-card-list">
            {selectedDeveloperChecklists.map((checklist) => {
              const completed = checklist.tasks.filter((task) => task.completed).length
              const total = checklist.tasks.length
              const percent = total ? Math.round((completed / total) * 100) : 0
              return (
                <div key={checklist.id} className="task-item manager-row manager-item-row">
                  <div>
                    <strong>Checklist #{checklist.id}</strong>
                    <div>
                      <small>
                        Status:
                        {' '}
                        <span className={statusToClassName(checklist.status)}>{formatStatus(checklist.status)}</span>
                      </small>
                    </div>
                  </div>
                  <div>
                    <small>
                      {completed}/{total} tasks ({percent}%)
                    </small>
                  </div>
                </div>
              )
            })}
          </div>
          {!selectedDeveloperChecklists.length && <p>No checklists found for this developer.</p>}
        </section>
      )}

      {isManager && (
        <section className="card section-block manage-templates-section">
          <h3>Manage Templates</h3>
          <div className="manager-card-list">
            {templates.map((template) => (
              <div key={template.id} className="task-item manager-row manager-item-row">
                <div>
                  <strong>{template.title}</strong>
                  <div>
                    <small>{template.description || 'No description'}</small>
                  </div>
                </div>
                <div className="template-actions">
                  <button type="button" onClick={() => onEditTemplate(template)} className="action-button">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteTemplate(template)}
                    className="action-button danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {!templates.length && <p>No templates found.</p>}
        </section>
      )}

      <section className="grid-two">
        <div className="card">
          <h3>My Dashboard Report</h3>
          <p>Total Checklists: {checklists.length}</p>
          <p>Assigned: {assignedChecklists}</p>
          <p>In Progress: {inProgressChecklists}</p>
          <p>Completed: {completedChecklists}</p>
          <p>Task Completion: {myCompletionPercent}%</p>
        </div>
        <div className="card">
          <h3>My Task Summary</h3>
          <p>Total Tasks: {totalTasks}</p>
          <p>Completed Tasks: {completedTasks}</p>
          <p>Pending Tasks: {totalTasks - completedTasks}</p>
        </div>
      </section>

      {isManager && reports.team.length > 0 && (
        <section className="grid-two">
          <div className="card">
            <h3>Team Status</h3>
            {reports.team.map((item) => (
              <div key={item.user_id} className="task-item manager-row compact-row">
                <span>{item.developer_name}</span>
                <small>
                  Active {item.active_checklists} | Completed {item.completed_checklists}
                </small>
              </div>
            ))}
          </div>
          <div className="card">
            <h3>Progress Report</h3>
            {reports.progress.map((item) => (
              <div key={item.checklist_id ?? item.user_id} className="task-item manager-row compact-row">
                <span>{item.developer_name ?? item.name}</span>
                <small>{item.completion_percent ?? item.progress_percent}%</small>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="stack">
        {checklists.map((checklist) => (
          <ChecklistCard key={checklist.id} checklist={checklist} onToggleTask={onToggleTask} />
        ))}
        {!checklists.length && <div className="card">No checklists assigned yet.</div>}
      </section>
    </main>
  )
}

export default DashboardPage
