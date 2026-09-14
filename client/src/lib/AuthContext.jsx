import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from './api.js'

const AuthContext = createContext({
  teacher: null,
  loading: true,
  waking: false,
  refresh: () => {},
  logout: () => {},
  updateAvatar: () => {},
})

// Render'ning bepul tarifida backend uzoq turgach "uxlab qoladi" — birinchi
// so'rov uni uyg'otish uchun 30s+ ketishi mumkin. Shu vaqt davomida oddiy
// "Yuklanmoqda…" o'rniga foydalanuvchiga nima bo'layotganini tushuntiramiz.
const WAKING_HINT_MS = 4000

export function AuthProvider({ children }) {
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [waking, setWaking] = useState(false)

  const refresh = useCallback(async () => {
    const wakingTimer = setTimeout(() => setWaking(true), WAKING_HINT_MS)
    try {
      const { teacher } = await api.get('/auth/me')
      setTeacher(teacher)
    } catch {
      setTeacher(null)
    } finally {
      clearTimeout(wakingTimer)
      setWaking(false)
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

  async function updateAvatar(dataUrl, videoDataUrl) {
    const { teacher } = await api.put('/auth/avatar', { avatar: dataUrl, video: videoDataUrl })
    setTeacher(teacher)
  }

  return (
    <AuthContext.Provider value={{ teacher, loading, waking, refresh, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
