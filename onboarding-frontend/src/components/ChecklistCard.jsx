import ProgressBar from './ProgressBar'
import TaskItem from './TaskItem'

function ChecklistCard({ checklist, onToggleTask }) {
  const completed = checklist.tasks.filter((task) => task.completed).length
  const total = checklist.tasks.length || 1
  const progress = Math.round((completed / total) * 100)
  const statusClass = `status-pill status-${checklist.status || 'assigned'}`

  return (
    <section className="card">
      <header className="card-header">
        <h3>Checklist #{checklist.id}</h3>
        <span className={statusClass}>{(checklist.status || '').replace('_', ' ')}</span>
      </header>
      <ProgressBar value={progress} />
      <div className="task-list">
        {checklist.tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={onToggleTask} />
        ))}
      </div>
    </section>
  )
}

export default ChecklistCard
