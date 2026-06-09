import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Onboarding Checklist</h1>
        <p className="muted-text">Sign in to access your onboarding tasks, templates, and team reports.</p>
        <label className="field-label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label className="field-label" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <p className="helper-text">Use your assigned role account to see role-specific dashboard sections.</p>
        {error && <div className="error-text">{error}</div>}
        <button type="submit">Login</button>
        <Link to="/register">Create account</Link>
      </form>
    </main>
  )
}

export default LoginPage
