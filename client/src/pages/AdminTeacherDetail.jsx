import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { IconArrowLeft, IconCheck } from '@tabler/icons-react'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/AuthContext.jsx'
import VerifiedBadge from '../components/VerifiedBadge.jsx'

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminTeacherDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { teacher: viewer } = useAuth()
  const [data, setData] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    try {
      const res = await api.get(`/admin/teachers/${id}`)
      setData(res)
      setName(res.teacher.name)
      setEmail(res.teacher.email || '')
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function saveFields(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/admin/teachers/${id}`, { name, email })
      await load()
    } finally {
      setSaving(false)
    }
  }

  const BODY_KEY = { verify: 'verified', block: 'blocked', admin: 'isAdmin' }

  async function toggle(field, value) {
    await api.put(`/admin/teachers/${id}/${field}`, { [BODY_KEY[field]]: value })
    load()
  }

  async function removeTeacher() {
    if (!confirm("Bu o'qituvchi va uning barcha testlari butunlay o'chiriladi. Davom etasizmi?")) return
    await api.del(`/admin/teachers/${id}`)
    navigate('/admin')
  }

  if (!viewer?.isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <p className="font-display text-xl font-extrabold text-anor">Ruxsat yo'q</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="font-bold text-anor">{error}</p>
          <Link to="/admin" className="btn-ghost mt-4 inline-flex">
            Admin panelga qaytish
          </Link>
        </div>
      </div>
    )
  }

  if (!data) return <div className="grid min-h-screen place-items-center text-ink-soft">Yuklanmoqda…</div>

  const { teacher, quizzes, posts } = data

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-cream/85 backdrop-blur">
        <div className="section flex h-16 items-center justify-between gap-3">
          <Link to="/admin" className="flex items-center gap-2.5">
            <img src="/logo.svg?v=2" alt="" width={36} height={36} />
            <span className="font-display text-lg font-extrabold text-ink">
              Admin <span className="text-gold-light">panel</span>
            </span>
          </Link>
          <Link to="/admin" className="btn-ghost !gap-1.5">
            <IconArrowLeft size={16} /> Ro'yxatga
          </Link>
        </div>
      </header>

      <main className="section max-w-3xl py-10">
        <div className="flex items-center gap-4">
          {teacher.avatar ? (
            <img src={teacher.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-full bg-gold text-xl font-extrabold text-white">
              {teacher.name?.[0]?.toUpperCase() || '?'}
            </span>
          )}
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold text-ink">
              {teacher.name}
              {teacher.isVerified && <VerifiedBadge size={18} />}
            </h1>
            <p className="text-sm text-ink-soft">
              {teacher.provider} · Ro'yxatdan o'tgan: {fmtDate(teacher.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggle('verify', !teacher.isVerified)}
            className="chip !gap-1"
            data-active={teacher.isVerified}
          >
            {teacher.isVerified && <IconCheck size={12} />}
            {teacher.isVerified ? 'Tasdiqlangan' : 'Tasdiqlash'}
          </button>
          <button
            type="button"
            onClick={() => toggle('block', !teacher.isBlocked)}
            className={`chip ${teacher.isBlocked ? '!border-anor !text-anor' : ''}`}
          >
            {teacher.isBlocked ? 'Blokdan chiqarish' : 'Bloklash'}
          </button>
          <button type="button" onClick={() => toggle('admin', !teacher.isAdmin)} className="chip" data-active={teacher.isAdmin}>
            {teacher.isAdmin ? 'Admin huquqini olib tashlash' : 'Admin qilib tayinlash'}
          </button>
          <button type="button" onClick={removeTeacher} className="chip !border-anor !text-anor">
            O'chirish
          </button>
        </div>

        <form onSubmit={saveFields} className="card mt-6 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-ink-soft">Ism</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-ink-soft">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
          </div>
          <button type="submit" disabled={saving} className="btn-gold sm:col-span-2 justify-center">
            {saving ? 'Saqlanmoqda…' : 'Saqlash'}
          </button>
        </form>

        <h2 className="mt-8 font-display text-xl font-extrabold text-ink">Testlari ({quizzes.length})</h2>
        <div className="mt-3 space-y-2">
          {quizzes.map((q) => (
            <div key={q.id} className="card !p-3 flex items-center justify-between">
              <span className="font-bold text-ink">{q.title || '(nomsiz)'}</span>
              <span className="text-sm text-ink-soft">
                {q.questionCount} savol · {fmtDate(q.updatedAt)}
              </span>
            </div>
          ))}
          {quizzes.length === 0 && <p className="text-ink-soft">Hali test yo'q</p>}
        </div>

        <h2 className="mt-8 font-display text-xl font-extrabold text-ink">Forum postlari ({posts.length})</h2>
        <div className="mt-3 space-y-2">
          {posts.map((p) => (
            <div key={p.id} className="card !p-3">
              <p className="text-sm text-ink">{p.content}</p>
              <p className="mt-1 text-xs text-ink-soft">{fmtDate(p.createdAt)}</p>
            </div>
          ))}
          {posts.length === 0 && <p className="text-ink-soft">Hali post yo'q</p>}
        </div>
      </main>
    </div>
  )
}
