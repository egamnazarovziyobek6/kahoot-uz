import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import AnswerShape from './AnswerShape.jsx'
import { ANSWER_STYLES } from '../../lib/quiz.js'

export default function PreviewModal({ open, quiz, startIndex = 0, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <PreviewInner quiz={quiz} startIndex={startIndex} onClose={onClose} />
      )}
    </AnimatePresence>
  )
}

function PreviewInner({ quiz, startIndex, onClose }) {
  const total = quiz.questions.length
  const [i, setI] = useState(() => Math.max(0, Math.min(startIndex, total - 1)))
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!total) {
    return (
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="rounded-2xl bg-surface p-8 text-ink-soft">Savol yo‘q</div>
      </motion.div>
    )
  }

  const q = quiz.questions[Math.min(i, total - 1)]
  const visibleAnswers =
    q.type === 'input' ? [] : q.answers.filter((a) => a.text.trim() || q.type === 'truefalse')

  function go(d) {
    setRevealed(false)
    setI((v) => Math.max(0, Math.min(total - 1, v + d)))
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl"
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 12 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-3 text-white"
          style={{ background: quiz.themeColor }}
        >
          <span className="font-display text-sm font-extrabold">
            Ko‘rib chiqish · Savol {i + 1}/{total}
          </span>
          <button type="button" onClick={onClose} className="text-lg">
            ✕
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-center font-display text-2xl font-extrabold text-ink">
            {q.text.trim() || 'Savol matni…'}
          </h3>

          {q.image && (
            <img src={q.image} alt="" className="mx-auto mt-4 max-h-52 rounded-xl object-contain" />
          )}

          <p className="mt-3 text-center text-sm font-bold text-ink-soft">{q.timeLimit} soniya</p>

          {q.type === 'input' ? (
            <div className="mx-auto mt-5 max-w-sm">
              <div className="field text-center text-ink-soft">Javobni yozing…</div>
              {revealed && (
                <p className="mt-3 text-center text-sm font-bold text-chaman">
                  To‘g‘ri javob: {q.answers.map((a) => a.text).filter(Boolean).join(', ') || '—'}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {visibleAnswers.map((a, idx) => {
                const st = ANSWER_STYLES[idx % ANSWER_STYLES.length]
                const dim = revealed && !a.correct
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setRevealed(true)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-4 text-left font-display text-lg font-extrabold text-white transition-opacity ${
                      dim ? 'opacity-35' : 'opacity-100'
                    }`}
                    style={{ background: st.color }}
                  >
                    <AnswerShape shape={st.shape} size={22} />
                    <span className="flex-1">{a.text || `Javob ${idx + 1}`}</span>
                    {revealed && a.correct && <span>✓</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={i === 0}
            className="chip disabled:opacity-30"
          >
            ‹ Oldingi
          </button>
          <button type="button" onClick={() => setRevealed((v) => !v)} className="chip">
            {revealed ? 'Javobni yashirish' : 'To‘g‘ri javobni ko‘rsatish'}
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={i === total - 1}
            className="chip disabled:opacity-30"
          >
            Keyingi ›
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
