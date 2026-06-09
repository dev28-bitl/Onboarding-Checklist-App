function TaskItem({ task, onToggle }) {
  return (
    <div className="task-item">
      <label className="task-main">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(event) => onToggle(task, event.target.checked)}
        />
        <span className="task-title">{task.task_name}</span>
      </label>
      <div className="task-meta">
        <small>{task.category}</small>
        <span className={`task-state ${task.completed ? 'done' : 'pending'}`}>
          {task.completed ? 'Completed' : 'Pending'}
        </span>
      </div>
    </div>
  )
}

export default TaskItem
