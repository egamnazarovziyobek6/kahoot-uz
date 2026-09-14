import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconCheck, IconDownload, IconVideo } from '@tabler/icons-react'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/AuthContext.jsx'
import VerifiedBadge from '../components/VerifiedBadge.jsx'
import TrendChart from '../components/admin/TrendChart.jsx'

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Obyektlar ro'yxatini CSV faylga aylantirib, yuklab olishni boshlaydi */
function downloadCsv(filename, rows, columns) {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = columns.map((c) => escape(c.label)).join(',')
  const lines = rows.map((row) => columns.map((c) => escape(row[c.key])).join(','))
  const csv = [header, ...lines].join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function Admin() {
  const { teacher } = useAuth()
  const [stats, setStats] = useState(null)
  const [dailyStats, setDailyStats] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [rooms, setRooms] = useState([])
  const [posts, setPosts] = useState([])
  const [moderation, setModeration] = useState([])
  const [tab, setTab] = useState('teachers')
  const [error, setError] = useState(null)
  const [teacherQuery, setTeacherQuery] = useState('')
  const [quizQuery, setQuizQuery] = useState('')

  async function loadAll() {
    try {
      const [s, d, t, q, r, f, m] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/stats-daily'),
        api.get('/admin/teachers'),
        api.get('/admin/quizzes'),
        api.get('/admin/rooms'),
        api.get('/forum/posts'),
        api.get('/admin/moderation'),
      ])
      setStats(s)
      setDailyStats(d)
      setTeachers(t)
      setQuizzes(q)
      setRooms(r)
      setPosts(f.posts)
      setModeration(m)
    } catch (e) {
      setError(e.message)
    }
  }

  const filteredTeachers = useMemo(() => {
    const q = teacherQuery.trim().toLowerCase()
    if (!q) return teachers
    return teachers.filter(
      (t) => t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q),
    )
  }, [teachers, teacherQuery])

  const filteredQuizzes = useMemo(() => {
    const q = quizQuery.trim().toLowerCase()
    if (!q) return quizzes
    return quizzes.filter(
      (qz) => qz.title?.toLowerCase().includes(q) || qz.teacherName?.toLowerCase().includes(q),
    )
  }, [quizzes, quizQuery])

  const pendingModerationCount = moderation.filter((m) => m.status === 'pending').length

  useEffect(() => {
    loadAll()
    const t = setInterval(loadAll, 15000)
    return () => clearInterval(t)
  }, [])

  async function deleteTeacher(id) {
    if (!confirm("Bu o'qituvchi va uning barcha testlari o'chiriladi. Davom etasizmi?")) return
    await api.del(`/admin/teachers/${id}`)
    loadAll()
  }

  async function deleteQuiz(id) {
    if (!confirm('Bu test butunlay o‘chiriladi. Davom etasizmi?')) return
    await api.del(`/admin/quizzes/${id}`)
    loadAll()
  }

  async function toggleVerified(t) {
    await api.put(`/admin/teachers/${t.id}/verify`, { verified: !t.isVerified })
    loadAll()
  }

  async function toggleBlocked(t) {
    if (!t.isBlocked && !confirm(`${t.name} bloklansinmi? U kira olmay qoladi va yangi o'yin ochib bo'lmaydi.`)) {
      return
    }
    await api.put(`/admin/teachers/${t.id}/block`, { blocked: !t.isBlocked })
    loadAll()
  }

  async function deletePost(id) {
    if (!confirm("Bu post o'chiriladi. Davom etasizmi?")) return
    await api.del(`/admin/forum/posts/${id}`)
    loadAll()
  }

  async function reviewModeration(id, status) {
    await api.put(`/admin/moderation/${id}`, { status })
    loadAll()
  }

  if (!teacher?.isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="font-display text-xl font-extrabold text-anor">Ruxsat yo'q</p>
          <p className="mt-2 text-ink-soft">Bu sahifa faqat admin hisoblar uchun.</p>
          <Link to="/" className="btn-gold mt-4 inline-flex">
            Bosh sahifaga
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-cream/85 backdrop-blur">
        <div className="section flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.svg?v=2" alt="" width={36} height={36} />
            <span className="font-display text-lg font-extrabold text-ink">
              Admin <span className="text-gold-light">panel</span>
            </span>
          </Link>
          <Link to="/testlarim" className="btn-ghost">
            Testlarim
          </Link>
        </div>
      </header>

      <main className="section py-10">
        {error && <p className="mb-4 font-bold text-anor">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dailyStats ? (
            <>
              <TrendChart data={dailyStats.signups} color="#14b8c7" label="Yangi o'qituvchilar" />
              <TrendChart data={dailyStats.quizzesCreated} color="#f5a623" label="Yaratilgan testlar" />
              <TrendChart data={dailyStats.gamesPlayed} color="#2fd583" label="O'ynalgan o'yinlar" />
            </>
          ) : (
            <p className="text-ink-soft sm:col-span-3">Statistika yuklanmoqda…</p>
          )}
          <div className="card">
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">Faol o'yinlar</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-chaman">
              {stats?.activeRooms ?? '—'}
            </p>
            <p className="mt-1 text-xs text-ink-soft">hozir</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {[
            ['teachers', "O'qituvchilar"],
            ['quizzes', 'Testlar'],
            ['rooms', "Faol o'yinlar"],
            ['posts', 'Forum'],
            [
              'moderation',
              `Moderatsiya${pendingModerationCount ? ` (${pendingModerationCount})` : ''}`,
            ],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className="chip"
              data-active={tab === key}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'teachers' && (
          <div className="card mt-4 overflow-x-auto !p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-4 py-2.5">
              <p className="text-xs font-bold text-ink-soft">
                {filteredTeachers.length} ta o'qituvchi
                {teacherQuery && ` (${teachers.length} tadan)`}
              </p>
              <div className="flex items-center gap-3">
                <input
                  value={teacherQuery}
                  onChange={(e) => setTeacherQuery(e.target.value)}
                  placeholder="Ism yoki email bo'yicha qidirish…"
                  className="field !w-56 !py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv('oqituvchilar.csv', filteredTeachers, [
                      { key: 'name', label: 'Ism' },
                      { key: 'email', label: 'Email' },
                      { key: 'provider', label: 'Provider' },
                      { key: 'quizCount', label: 'Testlar' },
                      { key: 'createdAt', label: "Ro'yxatdan o'tgan" },
                    ])
                  }
                  className="shrink-0 text-xs font-bold text-gold-light hover:underline"
                >
                  <IconDownload size={13} className="inline -mt-0.5" /> CSV yuklab olish
                </button>
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Ism</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Testlar</th>
                  <th className="px-4 py-3">Ro'yxatdan o'tgan</th>
                  <th className="px-4 py-3">Tasdiqlash</th>
                  <th className="px-4 py-3">Bloklash</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((t) => (
                  <tr key={t.id} className={`border-t border-white/5 ${t.isBlocked ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-bold text-ink">
                      <Link to={`/admin/teachers/${t.id}`} className="inline-flex items-center gap-1.5 hover:text-gold-light">
                        {t.name}
                        {t.isVerified && <VerifiedBadge size={14} />}
                        {t.isAdmin && <span className="text-xs text-saffron">admin</span>}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {t.email ? (
                        <a href={`mailto:${t.email}`} className="text-gold-light hover:underline">
                          {t.email}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{t.provider}</td>
                    <td className="px-4 py-3 text-ink-soft">{t.quizCount}</td>
                    <td className="px-4 py-3 text-ink-soft">{fmtDate(t.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleVerified(t)}
                        className="chip !gap-1 !py-1 !text-xs"
                        data-active={t.isVerified}
                      >
                        {t.isVerified && <IconCheck size={12} />}
                        {t.isVerified ? 'Tasdiqlangan' : 'Tasdiqlash'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleBlocked(t)}
                        className={`chip !py-1 !text-xs ${t.isBlocked ? '!border-anor !text-anor' : ''}`}
                      >
                        {t.isBlocked ? 'Blokdan chiqarish' : 'Bloklash'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteTeacher(t.id)}
                        className="text-xs font-bold text-anor hover:underline"
                      >
                        O'chirish
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-ink-soft">
                      {teacherQuery ? 'Hech narsa topilmadi' : "Hali o'qituvchi yo'q"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'quizzes' && (
          <div className="card mt-4 overflow-x-auto !p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-4 py-2.5">
              <p className="text-xs font-bold text-ink-soft">
                {filteredQuizzes.length} ta test
                {quizQuery && ` (${quizzes.length} tadan)`}
              </p>
              <div className="flex items-center gap-3">
                <input
                  value={quizQuery}
                  onChange={(e) => setQuizQuery(e.target.value)}
                  placeholder="Sarlavha yoki o'qituvchi bo'yicha qidirish…"
                  className="field !w-56 !py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv('testlar.csv', filteredQuizzes, [
                      { key: 'title', label: 'Sarlavha' },
                      { key: 'teacherName', label: "O'qituvchi" },
                      { key: 'questionCount', label: 'Savollar' },
                      { key: 'updatedAt', label: 'Yangilangan' },
                    ])
                  }
                  className="shrink-0 text-xs font-bold text-gold-light hover:underline"
                >
                  <IconDownload size={13} className="inline -mt-0.5" /> CSV yuklab olish
                </button>
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Sarlavha</th>
                  <th className="px-4 py-3">O'qituvchi</th>
                  <th className="px-4 py-3">Savollar</th>
                  <th className="px-4 py-3">Yangilangan</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map((q) => (
                  <tr key={q.id} className="border-t border-white/5">
                    <td className="px-4 py-3 font-bold text-ink">{q.title || '(nomsiz)'}</td>
                    <td className="px-4 py-3 text-ink-soft">{q.teacherName}</td>
                    <td className="px-4 py-3 text-ink-soft">{q.questionCount}</td>
                    <td className="px-4 py-3 text-ink-soft">{fmtDate(q.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteQuiz(q.id)}
                        className="text-xs font-bold text-anor hover:underline"
                      >
                        O'chirish
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredQuizzes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-ink-soft">
                      {quizQuery ? 'Hech narsa topilmadi' : "Hali test yo'q"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'rooms' && (
          <div className="card mt-4 overflow-x-auto !p-0">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3">PIN</th>
                  <th className="px-4 py-3">Holat</th>
                  <th className="px-4 py-3">O'yinchilar</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.pin} className="border-t border-white/5">
                    <td className="px-4 py-3 font-mono font-bold text-ink">{r.pin}</td>
                    <td className="px-4 py-3 text-ink-soft">{r.status}</td>
                    <td className="px-4 py-3 text-ink-soft">{r.playerCount}</td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-ink-soft">
                      Hozir faol o'yin yo'q
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'posts' && (
          <div className="mt-4 space-y-3">
            {posts.map((p) => (
              <div key={p.id} className="card !p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 font-extrabold text-ink">
                      {p.name}
                      {p.isVerified && <VerifiedBadge size={13} />}
                      <span className="text-xs font-normal text-ink-soft">
                        · {p.authorType === 'teacher' ? "o'qituvchi" : 'mehmon'}
                      </span>
                    </span>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-ink-soft">{p.content}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deletePost(p.id)}
                    className="shrink-0 text-xs font-bold text-anor hover:underline"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p className="py-10 text-center text-ink-soft">Hali post yo'q</p>}
          </div>
        )}

        {tab === 'moderation' && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-ink-soft">
              Profil rasmi yangilanganda shu yerga qo'shiladi. Video (agar yuborilgan bo'lsa) bazaga
              saqlanmaydi — Telegram moderatsiya chatidan ko'rish mumkin.
            </p>
            {moderation.map((m) => {
              const relatedTeacher = teachers.find((t) => t.id === m.teacherId)
              return (
                <div key={m.id} className="card flex items-start gap-4 !p-4">
                  {m.photo && (
                    <img
                      src={m.photo}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl border border-white/10 object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/admin/teachers/${m.teacherId}`}
                        className="font-extrabold text-ink hover:text-gold-light"
                      >
                        {m.teacherName}
                      </Link>
                      {m.videoSent && (
                        <span className="chip inline-flex items-center gap-1 !py-0.5 !text-[11px]">
                          <IconVideo size={12} /> video Telegram'da
                        </span>
                      )}
                      <span
                        className={`chip !py-0.5 !text-[11px] ${
                          m.status === 'approved'
                            ? '!border-chaman !text-chaman'
                            : m.status === 'rejected'
                              ? '!border-anor !text-anor'
                              : ''
                        }`}
                      >
                        {m.status === 'approved'
                          ? 'Tasdiqlangan'
                          : m.status === 'rejected'
                            ? 'Rad etilgan'
                            : 'Kutilmoqda'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-soft">{fmtDate(m.submittedAt)}</p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => reviewModeration(m.id, 'approved')}
                            className="chip !py-1 !text-xs !border-chaman !text-chaman"
                          >
                            Tasdiqlash
                          </button>
                          <button
                            type="button"
                            onClick={() => reviewModeration(m.id, 'rejected')}
                            className="chip !py-1 !text-xs !border-anor !text-anor"
                          >
                            Rad etish
                          </button>
                        </>
                      )}
                      {relatedTeacher && !relatedTeacher.isBlocked && (
                        <button
                          type="button"
                          onClick={() => toggleBlocked(relatedTeacher)}
                          className="chip !py-1 !text-xs !border-anor !text-anor"
                        >
                          O'qituvchini bloklash
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {moderation.length === 0 && (
              <p className="py-10 text-center text-ink-soft">Hali moderatsiya yozuvi yo'q</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
