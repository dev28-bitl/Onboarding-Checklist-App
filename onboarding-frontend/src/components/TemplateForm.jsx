import { useState } from 'react'

const defaultTasks = [
  { task_name: 'GitHub access granted', category: 'Repository Access' },
  { task_name: 'IDE installed', category: 'Development Environment' },
  { task_name: 'Manager introduction call', category: 'Team Introduction' },
  { task_name: 'Coding standards review', category: 'Documentation' },
]

function TemplateForm({ onSubmit }) {
  const [title, setTitle] = useState('New Developer Onboarding')
  const [description, setDescription] = useState('Baseline onboarding template for engineering team')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ title, description, tasks: defaultTasks })
  }

  return (
    <form className="card template-form" onSubmit={handleSubmit}>
      <h3>Create Template</h3>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Template title"
        className="template-input"
      />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description"
        className="template-textarea"
      />
      <button type="submit" className="action-button template-submit">Create Template</button>
    </form>
  )
}

export default TemplateForm
