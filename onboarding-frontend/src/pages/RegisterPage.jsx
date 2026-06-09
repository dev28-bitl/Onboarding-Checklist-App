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
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          required
        />
        <select name="role" value={form.role} onChange={onChange}>
          <option value="developer">Developer</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        {error && <div className="error-text">{error}</div>}
        <button type="submit">Register</button>
        <Link to="/login">Back to login</Link>
      </form>
    </main>
  )
}

export default RegisterPage
