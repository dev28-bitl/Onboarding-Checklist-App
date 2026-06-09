import ProgressBar from './ProgressBar'
import TaskItem from './TaskItem'

function ChecklistCard({ checklist, onToggleTask }) {
  const completed = checklist.tasks.filter((task) => task.completed).length
  const total = checklist.tasks.length || 1
  const progress = Math.round((completed / total) * 100)
  const statusClass = `status-pill status-${checklist.status || 'assigned'}`
  const assignedOn = checklist.assigned_date
    ? new Date(checklist.assigned_date).toLocaleDateString()
    : 'N/A'

  return (
    <section className="card">
      <header className="card-header">
        <h3>Checklist #{checklist.id}</h3>
        <span className={statusClass}>{(checklist.status || '').replace('_', ' ')}</span>
      </header>
      <p className="helper-text">Assigned on {assignedOn}</p>
      <ProgressBar value={progress} />
      <p className="helper-text progress-caption">
        {completed} of {checklist.tasks.length} tasks completed
      </p>
      <div className="task-list">
        {checklist.tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={onToggleTask} />
        ))}
      </div>
    </section>
  )
}

export default ChecklistCard
