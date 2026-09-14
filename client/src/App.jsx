import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import { AuthProvider, useAuth } from './lib/AuthContext.jsx'

const Create = lazy(() => import('./pages/Create.jsx'))
const MyQuizzes = lazy(() => import('./pages/MyQuizzes.jsx'))
const Host = lazy(() => import('./pages/Host.jsx'))
const Play = lazy(() => import('./pages/Play.jsx'))
const Admin = lazy(() => import('./pages/Admin.jsx'))
const AdminTeacherDetail = lazy(() => import('./pages/AdminTeacherDetail.jsx'))
const Forum = lazy(() => import('./pages/Forum.jsx'))

function RequireAuth({ children }) {
  const { teacher, loading, waking } = useAuth()
  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-cream text-ink-soft">
        <div className="text-center">
          <p>{waking ? 'Server uyg‘onmoqda, biroz kuting…' : 'Yuklanmoqda…'}</p>
          {waking && (
            <p className="mt-1 text-sm text-ink-soft/70">
              Bepul serverga uzoq tashrif bo‘lmasa, birinchi so‘rov 30-40 soniya olishi mumkin.
            </p>
          )}
        </div>
      </div>
    )
  }
  if (!teacher) return <Navigate to="/login" replace />
  return children
}

function RouteFallback() {
  return <div className="grid h-screen place-items-center bg-cream text-ink-soft">Yuklanmoqda…</div>
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<RouteFallback />}>
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
          <Route path="/forum" element={<Forum />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <Admin />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/teachers/:id"
            element={
              <RequireAuth>
                <AdminTeacherDetail />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Landing />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
