import { createContext, useState, useEffect, useContext } from 'react'
import { authApi } from '@/lib/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load token from localStorage and restore user session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      setToken(savedToken)
      authApi.getMe()
        .then(userData => setUser(userData))
        .catch(() => {
          // Token expired or invalid — clear it
          localStorage.removeItem('auth_token')
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const register = async (email, password, fullName) => {
    setError(null)
    try {
      const response = await authApi.register(email, password, fullName)
      localStorage.setItem('auth_token', response.token)
      setToken(response.token)
      setUser(response.user)
      return response
    } catch (err) {
      const message = err.message || 'Registration failed'
      setError(message)
      throw err
    }
  }

  const login = async (email, password) => {
    setError(null)
    try {
      const response = await authApi.login(email, password)
      localStorage.setItem('auth_token', response.token)
      setToken(response.token)
      setUser(response.user)
      return response
    } catch (err) {
      const message = err.message || 'Login failed'
      setError(message)
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setToken(null)
    setUser(null)
    setError(null)
  }

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    register,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
