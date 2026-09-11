import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from './api.js'

const AuthContext = createContext({
  teacher: null,
  loading: true,
  refresh: () => {},
  logout: () => {},
})

export function AuthProvider({ children }) {
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const { teacher } = await api.get('/auth/me')
      setTeacher(teacher)
    } catch {
      setTeacher(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      setTeacher(null)
    }
  }

  return (
    <AuthContext.Provider value={{ teacher, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
