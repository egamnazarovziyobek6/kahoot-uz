import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { getSocket, disconnectSocket } from '../lib/socket.js'
import { getQuiz } from '../lib/quizStore.js'
import { ANSWER_STYLES } from '../lib/quiz.js'
import AnswerShape from '../components/create/AnswerShape.jsx'
import Mascot from '../components/mascots/Mascot.jsx'
import Confetti from '../components/Confetti.jsx'
import { DEFAULT_CHARACTER } from '../lib/avatarParts.js'
import { bounceIn, celebrate, fadeUp } from '../lib/motion.js'

export default function Host() {
  const { pin: pinFromUrl } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const quizId = location.state?.quizId
  const socketRef = useRef(null)

  const [quiz, setQuiz] = useState(null)
  const [pin, setPin] = useState(pinFromUrl && pinFromUrl !== 'yangi' ? pinFromUrl : null)
  const [phase, setPhase] = useState('connecting') // connecting | lobby | question | ended
  const [players, setPlayers] = useState([])
  const [question, setQuestion] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [progress, setProgress] = useState({ answered: 0, total: 0 })
  const [result, setResult] = useState(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [error, setError] = useState(null)

  // Test ma'lumotini (nomi, savollar soni) ko'rsatish uchun yuklaymiz
  useEffect(() => {
    if (!quizId) return
    getQuiz(quizId).then(setQuiz).catch(() => setQuiz(null))
  }, [quizId])

  useEffect(() => {
    if (!quizId) {
      setError("Test tanlanmagan. 'Testlarim' dan o'yinni boshlang.")
      return
    }
    const socket = getSocket()
    socketRef.current = socket

    function onLobby({ players }) {
      setPlayers(players)
    }
    function onQuestionShow(payload) {
      setQuestion(payload)
      setSecondsLeft(payload.question.timeLimit)
      setPhase('question')
    }
    function onProgress(p) {
      setProgress(p)
    }
    function onEnded(payload) {
      setResult(payload)
      setPhase('ended')
    }
    function onClosed() {
      setError("O'yin yopildi")
    }

    socket.on('lobby:update', onLobby)
    socket.on('question:show', onQuestionShow)
    socket.on('answer:progress', onProgress)
    socket.on('game:ended', onEnded)
    socket.on('game:closed', onClosed)

    socket.emit('host:create', {}, (res) => {
      if (res?.error) {
        setError(res.error)
        return
      }
      setPin(res.pin)
      setPhase('lobby')
      navigate(`/host/${res.pin}`, { replace: true, state: { quizId } })
    })

    return () => {
      socket.off('lobby:update', onLobby)
      socket.off('question:show', onQuestionShow)
      socket.off('answer:progress', onProgress)
      socket.off('game:ended', onEnded)
      socket.off('game:closed', onClosed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId])

  useEffect(() => {
    return () => disconnectSocket()
  }, [])

  // Mahalliy sanoqli taymer (server javob vaqtini o'zi boshqaradi)
  useEffect(() => {
    if (phase !== 'question' || secondsLeft <= 0) return
    const t = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearTimeout(t)
  }, [phase, secondsLeft])

  function startGame() {
    socketRef.current?.emit('host:start', { quizId }, (res) => {
      if (res?.error) setError(res.error)
    })
  }

  function skipQuestion() {
    socketRef.current?.emit('host:skip')
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="font-display text-xl font-extrabold text-anor">{error}</p>
          <Link to="/testlarim" className="btn-samarkand mt-5 inline-flex">
            Testlarimga qaytish
          </Link>
        </div>
      </div>
    )
  }

  if (phase === 'connecting') {
    return (
      <div className="grid min-h-screen place-items-center text-ink-soft">Ulanmoqda…</div>
    )
  }

  if (phase === 'lobby') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-10 text-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">PIN kodi</p>
          <p className="font-display text-6xl font-extrabold tracking-[0.15em] text-samarkand sm:text-7xl">
            {pin}
          </p>
          <p className="mt-2 text-ink-soft">{quiz?.title || 'Test yuklanmoqda…'}</p>
        </div>

        <div className="flex min-h-16 flex-wrap items-center justify-center gap-3">
          <AnimatePresence>
            {players.map((p) => {
              const character = p.character || DEFAULT_CHARACTER
              return (
                <motion.div
                  key={p.id}
                  variants={bounceIn}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="flex flex-col items-center gap-1"
                >
                  <Mascot character={character} size={64} pose="wave" />
                  <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-extrabold text-ink shadow">
                    {p.name}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {players.length === 0 && (
            <p className="text-ink-soft">O‘quvchilar PIN kodi bilan qo‘shilishini kuting…</p>
          )}
        </div>

        <button
          type="button"
          onClick={startGame}
          disabled={players.length === 0}
          className="btn-primary text-lg disabled:opacity-40"
        >
          ▶ O‘yinni boshlash ({players.length})
        </button>
      </div>
    )
  }

  if (phase === 'question' && question) {
    const q = question.question
    return (
      <div className="flex min-h-screen flex-col px-4 py-6">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between text-sm font-bold text-ink-soft">
          <span>
            Savol {question.index + 1} / {question.total}
          </span>
          <span>{progress.answered}/{progress.total} javob berdi</span>
          <span
            className={secondsLeft <= 5 ? 'text-anor' : ''}
          >
            ⏱ {secondsLeft}s
          </span>
        </div>

        <div className="mx-auto mt-6 flex w-full max-w-4xl flex-1 flex-col">
          <motion.div
            key={q.id}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="card items-center justify-center py-10 text-center"
          >
            <p className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{q.text}</p>
            {q.image && (
              <img src={q.image} alt="" className="mt-4 max-h-64 rounded-xl object-contain" />
            )}
          </motion.div>

          {q.type !== 'input' ? (
            <div className="mt-5 grid flex-1 gap-3 sm:grid-cols-2">
              {q.answers.map((a, i) => {
                const style = ANSWER_STYLES[i % ANSWER_STYLES.length]
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-2xl p-5 text-white shadow-lg"
                    style={{ background: style.color }}
                  >
                    <AnswerShape shape={style.shape} size={26} />
                    <span className="font-display text-lg font-extrabold">{a.text}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="mt-6 text-center font-bold text-ink-soft">
              O‘quvchilar javobni yozib yubormoqda…
            </p>
          )}

          <button type="button" onClick={skipQuestion} className="btn-ghost mx-auto mt-6">
            Keyingisi ›
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'ended' && result) {
    const top3 = result.leaderboard.slice(0, 3)
    const rest = result.leaderboard.slice(3)
    return (
      <div className="relative min-h-screen px-4 py-10">
        <Confetti />
        <div className="mx-auto max-w-3xl">
          <h1 className="text-center font-display text-3xl font-extrabold text-ink">
            O‘yin tugadi! 🎉
          </h1>

          <motion.div
            variants={celebrate}
            initial="hidden"
            animate="show"
            className="mt-8 flex items-end justify-center gap-4"
          >
            {[top3[1], top3[0], top3[2]].map((p, i) =>
              p ? (
                <motion.div
                  key={p.id}
                  variants={bounceIn}
                  className="flex flex-col items-center gap-2"
                  style={{ order: i }}
                >
                  <Mascot
                    character={p.character || DEFAULT_CHARACTER}
                    size={i === 1 ? 88 : 68}
                    pose="cheer"
                  />
                  <div
                    className="flex w-24 flex-col items-center justify-end rounded-t-xl text-white"
                    style={{
                      height: p.rank === 1 ? 110 : p.rank === 2 ? 82 : 60,
                      background:
                        p.rank === 1 ? '#F5A623' : p.rank === 2 ? '#0E7C9D' : '#E24A3B',
                    }}
                  >
                    <span className="mb-2 text-center text-xs font-extrabold leading-tight">
                      {p.name}
                      <br />
                      {p.score}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div key={i} />
              ),
            )}
          </motion.div>

          {rest.length > 0 && (
            <motion.ol
              variants={celebrate}
              initial="hidden"
              animate="show"
              className="mx-auto mt-8 max-w-md space-y-2"
            >
              {rest.map((p) => (
                <motion.li
                  key={p.id}
                  variants={bounceIn}
                  className="flex items-center justify-between rounded-xl bg-surface px-4 py-2 shadow"
                >
                  <span className="font-bold text-ink-soft">
                    {p.rank}. {p.name}
                  </span>
                  <span className="font-extrabold text-ink">{p.score}</span>
                </motion.li>
              ))}
            </motion.ol>
          )}

          <div className="mt-8 flex justify-center gap-3">
            <button type="button" onClick={() => setReviewOpen((v) => !v)} className="btn-ghost">
              {reviewOpen ? 'Sharhni yopish' : 'Savollar sharhi'}
            </button>
            <Link to="/testlarim" className="btn-samarkand">
              Testlarimga qaytish
            </Link>
          </div>

          {reviewOpen && (
            <div className="mt-6 space-y-4">
              {result.review.map((q, i) => (
                <div key={q.id} className="card !p-4">
                  <p className="font-display font-extrabold text-ink">
                    {i + 1}. {q.text}
                  </p>
                  <p className="mt-1 text-sm font-bold text-chaman">
                    To‘g‘ri javob: {q.correctAnswers.join(', ')}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                    {q.players.map((pl) => (
                      <li
                        key={pl.playerId}
                        className={`rounded-full px-2.5 py-1 ${
                          pl.correct ? 'bg-chaman/15 text-chaman' : 'bg-anor/10 text-anor-deep'
                        }`}
                      >
                        {pl.name} {pl.correct ? '✓' : '✕'} ({pl.points})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
