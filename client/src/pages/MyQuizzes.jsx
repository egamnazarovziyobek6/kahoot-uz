import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Mascot from '../components/mascots/Mascot.jsx'
import { characters } from '../lib/characters.js'
import { listQuizzes, deleteQuiz, duplicateQuiz } from '../lib/quizStore.js'
import { validateQuiz } from '../lib/quiz.js'

const UZ_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
]

function fmtDate(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  if (sameDay) return 'bugun'
  return `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}`
}

export default function MyQuizzes() {
  const [quizzes, setQuizzes] = useState(() => listQuizzes())

  function refresh() {
    setQuizzes(listQuizzes())
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/85 backdrop-blur">
        <div className="section flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" width={36} height={36} />
            <span className="font-display text-lg font-extrabold text-ink">
              Kahoot <span className="text-samarkand">UZ</span>
            </span>
          </Link>
          <Link to="/yaratish" className="btn-primary !px-4 !py-2 text-sm">
            + Yangi test
          </Link>
        </div>
      </header>

      <main className="section py-10">
        <h1 className="font-display text-3xl font-extrabold text-ink">Mening testlarim</h1>
        <p className="mt-2 text-ink-soft">
          Testlar hozircha shu brauzerda saqlanadi. Server ulangach, ular hisobingizga bog‘lanadi.
        </p>

        {quizzes.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-2xl border-2 border-dashed border-black/10 py-16 text-center">
            <Mascot character={characters[2]} size={140} pose="wave" />
            <p className="mt-4 font-display text-xl font-extrabold text-ink">
              Hali test yo‘q
            </p>
            <p className="mt-1 text-ink-soft">Birinchi viktorinangizni bir necha daqiqada tuzing.</p>
            <Link to="/yaratish" className="btn-samarkand mt-5">
              Test yaratish
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((q) => {
              const v = validateQuiz(q)
              return (
                <article
                  key={q.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_10px_30px_-10px_rgba(34,48,74,0.22)]"
                >
                  <div
                    className="flex h-28 items-center justify-center bg-cover bg-center"
                    style={
                      q.cover
                        ? { backgroundImage: `url(${q.cover})` }
                        : { background: q.themeColor }
                    }
                  >
                    {!q.cover && (
                      <span className="font-display text-3xl font-extrabold text-white/90">
                        {(q.title || 'T').slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display text-lg font-extrabold text-ink">
                      {q.title || 'Nomsiz test'}
                    </h3>
                    <p className="mt-1 text-sm text-ink-soft">
                      {[q.subject, q.grade].filter(Boolean).join(' · ') || 'Fan belgilanmagan'}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-ink-soft">
                      <span className="rounded-full bg-cream px-2.5 py-1">
                        {q.questions.length} savol
                      </span>
                      <span>{fmtDate(q.updatedAt)}</span>
                      {!v.ok && (
                        <span className="rounded-full bg-saffron/20 px-2.5 py-1 text-saffron-light">
                          tugallanmagan
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-black/5 pt-3">
                      <Link
                        to={`/yaratish/${q.id}`}
                        className="btn-ghost !px-3 !py-1.5 text-xs"
                      >
                        ✎ Tahrirlash
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          duplicateQuiz(q.id)
                          refresh()
                        }}
                        className="btn-ghost !px-3 !py-1.5 text-xs"
                      >
                        ⧉ Nusxa
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`"${q.title || 'Nomsiz test'}" o‘chirilsinmi?`)) {
                            deleteQuiz(q.id)
                            refresh()
                          }
                        }}
                        className="btn-ghost !px-3 !py-1.5 text-xs hover:!border-anor hover:!text-anor"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
