import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginRequest, meRequest, registerRequest } from '../services/authService'

const AuthContext = createContext(null)

const TOKEN_KEY = 'onboarding_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const profile = await meRequest(token)
        setUser(profile)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [token])

  const login = async (email, password) => {
    const response = await loginRequest({ email, password })
    localStorage.setItem(TOKEN_KEY, response.access_token)
    setToken(response.access_token)
    setUser(response.user)
    return response.user
  }

  const register = async (payload) => {
    return registerRequest(payload)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout }),
    [token, user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
