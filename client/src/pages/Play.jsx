import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { getSocket, disconnectSocket } from '../lib/socket.js'
import { ANSWER_STYLES } from '../lib/quiz.js'
import AnswerShape from '../components/create/AnswerShape.jsx'
import Mascot from '../components/mascots/Mascot.jsx'
import Confetti from '../components/Confetti.jsx'
import { characters } from '../lib/characters.js'
import { bounceIn, fadeUp, popIn } from '../lib/motion.js'

export default function Play() {
  const { pin } = useParams()
  const navigate = useNavigate()
  const socketRef = useRef(null)

  const [step, setStep] = useState('name') // name | joining | lobby | question | waiting | ended
  const [name, setName] = useState('')
  const [characterId, setCharacterId] = useState(characters[0].id)
  const [error, setError] = useState(null)

  const [question, setQuestion] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [selected, setSelected] = useState([])
  const [myId, setMyId] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    function onQuestionShow(payload) {
      setQuestion(payload)
      setSecondsLeft(payload.question.timeLimit)
      setInputValue('')
      setSelected([])
      setStep('question')
    }
    function onEnded(payload) {
      setResult(payload)
      setStep('ended')
    }
    function onClosed() {
      setError("O'yin tugatildi yoki host chiqib ketdi.")
    }

    socket.on('question:show', onQuestionShow)
    socket.on('game:ended', onEnded)
    socket.on('game:closed', onClosed)

    return () => {
      socket.off('question:show', onQuestionShow)
      socket.off('game:ended', onEnded)
      socket.off('game:closed', onClosed)
    }
  }, [])

  useEffect(() => {
    return () => disconnectSocket()
  }, [])

  useEffect(() => {
    if (step !== 'question' || secondsLeft <= 0) return
    const t = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearTimeout(t)
  }, [step, secondsLeft])

  function join(e) {
    e?.preventDefault()
    if (!name.trim()) return
    setStep('joining')
    setError(null)
    const socket = getSocket()
    setMyId(socket.id)
    socket.emit('player:join', { pin, name: name.trim(), character: characterId }, (res) => {
      if (res?.error) {
        setError(res.error)
        setStep('name')
        return
      }
      setMyId(socket.id)
      setStep('lobby')
    })
  }

  function toggleSelect(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function submitAnswer(value) {
    if (step !== 'question') return
    setStep('waiting')
    socketRef.current?.emit('answer:submit', { value }, (res) => {
      if (res?.error) {
        // Vaqt tugab qolgan yoki xato — baribir keyingi savolni kutamiz
        setStep('waiting')
      }
    })
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <p className="font-display text-xl font-extrabold text-anor">{error}</p>
      </div>
    )
  }

  if (step === 'name' || step === 'joining') {
    const selected = characters.find((c) => c.id === characterId)
    return (
      <div className="grid min-h-screen place-items-center px-4 py-10">
        <motion.form
          variants={popIn}
          initial="hidden"
          animate="show"
          onSubmit={join}
          className="w-full max-w-sm rounded-3xl border border-black/5 bg-white p-6 text-center shadow-[0_18px_40px_-12px_rgba(34,48,74,0.35)]"
        >
          <p className="text-sm font-bold text-ink-soft">PIN {pin}</p>
          <div className="my-4 flex justify-center">
            <Mascot character={selected} size={110} pose="wave" />
          </div>

          <div className="mb-4 flex justify-center gap-2">
            {characters.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCharacterId(c.id)}
                aria-pressed={characterId === c.id}
                className={`grid h-10 w-10 place-items-center rounded-full border-2 transition-colors ${
                  characterId === c.id ? 'border-samarkand' : 'border-transparent'
                }`}
                style={{ background: c.color }}
                title={c.name}
              />
            ))}
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 20))}
            placeholder="Ismingiz"
            autoFocus
            className="field text-center font-display text-lg font-extrabold"
          />

          <button
            type="submit"
            disabled={!name.trim() || step === 'joining'}
            className="btn-primary mt-4 w-full disabled:opacity-60"
          >
            {step === 'joining' ? 'Kirilmoqda…' : "O'yinga kirish"}
          </button>
        </motion.form>
      </div>
    )
  }

  if (step === 'lobby') {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          >
            <Mascot
              character={characters.find((c) => c.id === characterId)}
              size={130}
              pose="idle"
            />
          </motion.div>
          <p className="mt-4 font-display text-xl font-extrabold text-ink">Tayyorsiz, {name}!</p>
          <p className="mt-1 text-ink-soft">O‘yin boshlanishini kuting…</p>
        </div>
      </div>
    )
  }

  if (step === 'question' && question) {
    const q = question.question
    return (
      <div className="flex min-h-screen flex-col px-4 py-6">
        <div className="mx-auto flex w-full max-w-md items-center justify-between text-sm font-bold text-ink-soft">
          <span>
            Savol {question.index + 1}/{question.total}
          </span>
          <span className={secondsLeft <= 5 ? 'text-anor' : ''}>⏱ {secondsLeft}s</span>
        </div>

        <motion.p
          key={q.id}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto mt-6 max-w-md text-center font-display text-xl font-extrabold text-ink"
        >
          {q.text}
        </motion.p>

        <div className="mx-auto mt-8 flex w-full max-w-md flex-1 flex-col justify-center">
          {q.type === 'input' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitAnswer(inputValue)
              }}
              className="flex flex-col gap-3"
            >
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Javobingizni yozing…"
                autoFocus
                className="field text-center text-lg"
              />
              <button type="submit" disabled={!inputValue.trim()} className="btn-primary">
                Yuborish
              </button>
            </form>
          ) : q.type === 'multi' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {q.answers.map((a, i) => {
                  const style = ANSWER_STYLES[i % ANSWER_STYLES.length]
                  const isSelected = selected.includes(a.id)
                  return (
                    <motion.button
                      key={a.id}
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => toggleSelect(a.id)}
                      className={`flex min-h-24 items-center gap-3 rounded-2xl px-4 py-3 text-left text-white shadow-lg transition-all ${
                        isSelected ? 'ring-4 ring-ink ring-offset-2 ring-offset-cream' : ''
                      }`}
                      style={{ background: style.color }}
                    >
                      <AnswerShape shape={style.shape} size={24} className="shrink-0" />
                      <span className="font-display text-base font-extrabold leading-tight">
                        {a.text}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => submitAnswer(selected)}
                disabled={selected.length === 0}
                className="btn-primary mt-4 disabled:opacity-50"
              >
                Javobni yuborish ({selected.length})
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {q.answers.map((a, i) => {
                const style = ANSWER_STYLES[i % ANSWER_STYLES.length]
                return (
                  <motion.button
                    key={a.id}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => submitAnswer(a.id)}
                    className="flex min-h-24 items-center gap-3 rounded-2xl px-4 py-3 text-left text-white shadow-lg"
                    style={{ background: style.color }}
                  >
                    <AnswerShape shape={style.shape} size={24} className="shrink-0" />
                    <span className="font-display text-base font-extrabold leading-tight">
                      {a.text}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (step === 'waiting') {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="text-5xl">✅</p>
          <p className="mt-3 font-display text-lg font-extrabold text-ink">
            Javobingiz qabul qilindi
          </p>
          <p className="mt-1 text-ink-soft">Keyingi savolni kuting…</p>
        </div>
      </div>
    )
  }

  if (step === 'ended' && result) {
    const me = result.leaderboard.find((p) => p.id === myId)
    const myReview = result.review.map((q) => ({
      ...q,
      mine: q.players.find((p) => p.playerId === myId),
    }))

    return (
      <div className="relative min-h-screen px-4 py-10 text-center">
        <Confetti count={16} />
        <p className="text-6xl">{me?.rank === 1 ? '🏆' : me?.rank === 2 ? '🥈' : me?.rank === 3 ? '🥉' : '🎉'}</p>
        <motion.div variants={bounceIn} initial="hidden" animate="show">
          <p className="mt-2 font-display text-2xl font-extrabold text-ink">
            {me ? `${me.rank}-o‘rin` : 'O‘yin tugadi'}
          </p>
          <p className="mt-1 text-ink-soft">Ball: {me?.score ?? 0}</p>
        </motion.div>

        <div className="mx-auto mt-8 max-w-md space-y-3 text-left">
          {myReview.map((q, i) => (
            <div key={q.id} className="card !p-3">
              <p className="text-sm font-extrabold text-ink">
                {i + 1}. {q.text}
              </p>
              <p className="mt-1 text-xs font-bold text-chaman">
                To‘g‘ri: {q.correctAnswers.join(', ')}
              </p>
              <p
                className={`mt-0.5 text-xs font-bold ${q.mine?.correct ? 'text-chaman' : 'text-anor'}`}
              >
                {q.mine?.correct ? `Sizniki to‘g‘ri edi (+${q.mine.points})` : 'Sizniki noto‘g‘ri edi'}
              </p>
            </div>
          ))}
        </div>

        <button type="button" onClick={() => navigate('/')} className="btn-samarkand mt-8">
          Bosh sahifaga
        </button>
      </div>
    )
  }

  return null
}
