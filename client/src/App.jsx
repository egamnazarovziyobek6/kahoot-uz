import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Create from './pages/Create.jsx'
import MyQuizzes from './pages/MyQuizzes.jsx'
import Host from './pages/Host.jsx'
import Play from './pages/Play.jsx'
import Admin from './pages/Admin.jsx'
import { AuthProvider, useAuth } from './lib/AuthContext.jsx'

function RequireAuth({ children }) {
  const { teacher, loading } = useAuth()
  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-cream text-ink-soft">Yuklanmoqda…</div>
    )
  }
  if (!teacher) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/testlarim"
          element={
            <RequireAuth>
              <MyQuizzes />
            </RequireAuth>
          }
        />
        <Route
          path="/yaratish"
          element={
            <RequireAuth>
              <Create />
            </RequireAuth>
          }
        />
        <Route
          path="/yaratish/:id"
          element={
            <RequireAuth>
              <Create />
            </RequireAuth>
          }
        />
        <Route
          path="/host/:pin"
          element={
            <RequireAuth>
              <Host />
            </RequireAuth>
          }
        />
        <Route path="/o'yin/:pin" element={<Play />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <Admin />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Landing />} />
      </Routes>
    </AuthProvider>
  )
}
