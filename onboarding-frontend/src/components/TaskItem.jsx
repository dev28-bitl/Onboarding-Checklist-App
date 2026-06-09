function TaskItem({ task, onToggle }) {
  return (
    <div className="task-item">
      <label>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(event) => onToggle(task, event.target.checked)}
        />
        <span>{task.task_name}</span>
      </label>
      <small>{task.category}</small>
    </div>
  )
}

export default TaskItem
