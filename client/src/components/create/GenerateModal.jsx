import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { IconLoader2, IconSparkles, IconX } from '@tabler/icons-react'
import { QUESTION_TYPES } from '../../lib/quiz.js'
import { api } from '../../lib/api.js'

/** "Gemini bilan yaratish" oynasi — mavzu bo'yicha savollar generatsiya qiladi */
export default function GenerateModal({ open, onClose, onInsert }) {
  const [topic, setTopic] = useState('')
  const [level, setLevel] = useState('')
  const [count, setCount] = useState(5)
  const [types, setTypes] = useState(Object.keys(QUESTION_TYPES))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  function toggleType(t) {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  async function generate() {
    if (!topic.trim()) {
      setError("Mavzuni kiriting (masalan: 'Present Simple')")
      return
    }
    setBusy(true)
    setError(null)
    try {
      const safeCount = Math.min(15, Math.max(1, Number(count) || 5))
      const { questions } = await api.post('/ai/generate-questions', {
        topic: topic.trim(),
        level,
        count: safeCount,
        types,
      })
      onInsert(questions)
      onClose()
      setTopic('')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-surface p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
                <IconSparkles size={18} className="text-gold" /> Gemini bilan savol yaratish
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-black/5"
              >
                <IconX size={18} />
              </button>
            </div>

            <label className="mb-3 block">
              <span className="mb-1.5 block text-sm font-bold text-ink">Mavzu *</span>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Masalan: Present Simple, Kundalik lug'at…"
                className="field"
                maxLength={100}
              />
            </label>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-ink">Daraja</span>
                <input
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder="Masalan: 6-sinf"
                  className="field"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-ink">Savollar soni</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={15}
                  value={count}
                  onChange={(e) => {
                    const raw = e.target.value
                    if (raw === '') {
                      setCount('')
                      return
                    }
                    const n = Number(raw)
                    if (!Number.isNaN(n)) setCount(n)
                  }}
                  onBlur={() => {
                    const n = Number(count)
                    setCount(Number.isFinite(n) && n > 0 ? Math.min(15, Math.max(1, Math.round(n))) : 5)
                  }}
                  className="field"
                />
              </label>
            </div>

            <div className="mb-5">
              <span className="mb-1.5 block text-sm font-bold text-ink">Savol turlari</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(QUESTION_TYPES).map(([key, t]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleType(key)}
                    data-active={types.includes(key)}
                    className="chip"
                  >
                    <t.icon size={14} /> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="mb-3 rounded-lg bg-anor/10 px-3 py-2 text-sm font-semibold text-anor-deep">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={generate}
              disabled={busy}
              className="btn-primary w-full !gap-1.5 disabled:opacity-60"
            >
              {busy ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" /> Yaratilmoqda…
                </>
              ) : (
                <>
                  <IconSparkles size={16} /> Savollarni yaratish
                </>
              )}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
