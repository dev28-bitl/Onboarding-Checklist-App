import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer',
  })
  const [error, setError] = useState('')

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/login')
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p className="muted-text">Create a role-based account to start onboarding workflow assignments.</p>
        <label className="field-label" htmlFor="name">Full name</label>
        <input id="name" name="name" placeholder="Alex Johnson" value={form.name} onChange={onChange} required />
        <label className="field-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="name@company.com" value={form.email} onChange={onChange} required />
        <label className="field-label" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Create a secure password"
          value={form.password}
          onChange={onChange}
          required
        />
        <label className="field-label" htmlFor="role">Role</label>
        <select id="role" name="role" value={form.role} onChange={onChange}>
          <option value="developer">Developer</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <p className="helper-text">Developers track tasks, managers assign templates, admins manage global onboarding.</p>
        {error && <div className="error-text">{error}</div>}
        <button type="submit">Register</button>
        <Link to="/login">Back to login</Link>
      </form>
    </main>
  )
}

export default RegisterPage
