import { useState } from 'react'
import { motion } from 'motion/react'
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
  IconPhoto,
  IconSparkles,
  IconX,
} from '@tabler/icons-react'
import { fadeUp } from '../../lib/motion.js'
import AutoTextarea from './AutoTextarea.jsx'
import AnswerTile from './AnswerTile.jsx'
import {
  QUESTION_TYPES,
  TIME_OPTIONS,
  POINTS_OPTIONS,
  ANSWER_STYLES,
  MAX_ANSWERS,
  MIN_ANSWERS,
  IMAGE_MAX_BYTES,
} from '../../lib/quiz.js'
import { api } from '../../lib/api.js'

export default function QuestionEditor({
  question,
  index,
  total,
  subject,
  errors = [],
  onPatch,
  onSetType,
  onPatchAnswer,
  onToggleCorrect,
  onAddAnswer,
  onRemoveAnswer,
  onPrev,
  onNext,
  onAdd,
}) {
  const [imgError, setImgError] = useState('')
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState(null)
  const q = question
  const isChoice = q.type === 'quiz' || q.type === 'multi'
  const isInput = q.type === 'input'

  async function checkWithGemini() {
    if (!q.text.trim()) return
    setChecking(true)
    setCheckResult(null)
    try {
      const result = await api.post('/ai/check-question', {
        type: q.type,
        text: q.text,
        answers: q.answers.map((a) => ({ text: a.text, correct: a.correct })),
        subject,
      })
      setCheckResult(result)
    } catch (e) {
      setCheckResult({ ok: false, issues: [e.message] })
    } finally {
      setChecking(false)
    }
  }

  function handleImage(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > IMAGE_MAX_BYTES) {
      setImgError('Rasm 2 MB dan kichik bo‘lishi kerak.')
      return
    }
    setImgError('')
    const reader = new FileReader()
    reader.onload = () => onPatch({ image: reader.result })
    reader.readAsDataURL(file)
  }

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6"
    >
      {/* Mobil savol navigatsiyasi */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={onPrev}
          disabled={index === 0}
          className="chip disabled:opacity-30"
        >
          <IconChevronLeft size={14} /> Oldingi
        </button>
        <span className="font-display text-sm font-extrabold text-ink">
          Savol {index + 1} / {total}
        </span>
        {index === total - 1 ? (
          <button type="button" onClick={() => onAdd('quiz')} className="chip">
            + Yangi
          </button>
        ) : (
          <button type="button" onClick={onNext} className="chip">
            Keyingi <IconChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Savol turi */}
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(QUESTION_TYPES).map(([key, t]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSetType(key)}
            data-active={q.type === key}
            className="chip !px-3 !py-1.5"
            title={t.hint}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Savol matni */}
      <div className="card !p-4">
        <AutoTextarea
          value={q.text}
          onChange={(e) => onPatch({ text: e.target.value })}
          placeholder="Savolni shu yerga yozing…"
          className="w-full bg-transparent font-display text-xl font-extrabold text-ink outline-none placeholder:font-sans placeholder:font-normal placeholder:text-ink-soft/45"
        />

        {/* Rasm */}
        <div className="mt-3 border-t border-white/5 pt-3">
          {q.image ? (
            <div className="relative inline-block">
              <img
                src={q.image}
                alt="Savol rasmi"
                className="max-h-56 rounded-xl border border-white/10 object-contain"
              />
              <button
                type="button"
                onClick={() => onPatch({ image: null })}
                className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-anor text-white shadow"
                title="Rasmni olib tashlash"
              >
                <IconX size={14} />
              </button>
            </div>
          ) : (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-white/15 px-3 py-2 text-sm font-bold text-ink-soft hover:border-gold hover:text-gold">
              <IconPhoto size={16} /> Rasm qo‘shish (ixtiyoriy)
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          )}
          {imgError && <p className="mt-1.5 text-sm font-semibold text-anor">{imgError}</p>}
        </div>
      </div>

      {/* Javoblar */}
      <div className="mt-5">
        <p className="mb-2 text-sm font-bold text-ink-soft">
          {q.type === 'multi'
            ? 'Bir nechta to‘g‘ri javobni belgilang'
            : q.type === 'input'
              ? 'Qabul qilinadigan javoblar (katta-kichik harf farqlanmaydi)'
              : 'Yashil belgi bilan to‘g‘ri javobni tanlang'}
        </p>

        {isInput ? (
          <div className="space-y-2">
            {q.answers.map((a, i) => (
              <div key={a.id} className="flex items-center gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-chaman text-white">
                  <IconCheck size={18} />
                </span>
                <input
                  value={a.text}
                  onChange={(e) => onPatchAnswer(a.id, { text: e.target.value, correct: true })}
                  placeholder={i === 0 ? 'To‘g‘ri javob' : 'Muqobil to‘g‘ri javob'}
                  className="field"
                />
                <button
                  type="button"
                  onClick={() => onRemoveAnswer(a.id)}
                  disabled={q.answers.length <= 1}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-anor/10 hover:text-anor disabled:opacity-25"
                  title="O‘chirish"
                >
                  <IconX size={16} />
                </button>
              </div>
            ))}
            {q.answers.length < 6 && (
              <button
                type="button"
                onClick={onAddAnswer}
                className="text-sm font-extrabold text-gold hover:underline"
              >
                + Muqobil javob
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {q.answers.map((a, i) => (
              <AnswerTile
                key={a.id}
                answer={a}
                style={ANSWER_STYLES[i % ANSWER_STYLES.length]}
                qtype={q.type}
                index={i}
                onText={(text) => onPatchAnswer(a.id, { text })}
                onToggleCorrect={() => onToggleCorrect(a.id)}
                onRemove={() => onRemoveAnswer(a.id)}
                canRemove={q.answers.length > MIN_ANSWERS}
              />
            ))}
          </div>
        )}

        {isChoice && q.answers.length < MAX_ANSWERS && (
          <button
            type="button"
            onClick={onAddAnswer}
            className="mt-2 text-sm font-extrabold text-gold hover:underline"
          >
            + Variant qo‘shish
          </button>
        )}
      </div>

      {/* Gemini bilan tekshirish */}
      <div className="mt-5">
        <button
          type="button"
          onClick={checkWithGemini}
          disabled={checking || !q.text.trim()}
          className="chip !gap-1.5 !px-3 !py-1.5 disabled:opacity-40"
        >
          {checking ? (
            <>
              <IconLoader2 size={14} className="animate-spin" /> Tekshirilmoqda…
            </>
          ) : (
            <>
              <IconSparkles size={14} /> Gemini bilan tekshirish
            </>
          )}
        </button>

        {checkResult && (
          <div
            className={`mt-2 rounded-xl p-3 text-sm ${
              checkResult.ok ? 'bg-chaman/10 text-chaman' : 'bg-saffron/15 text-ink'
            }`}
          >
            {checkResult.ok ? (
              <p className="flex items-center gap-1.5 font-bold">
                <IconCheck size={16} /> Gemini muammo topmadi
              </p>
            ) : (
              <>
                <p className="flex items-center gap-1.5 font-bold">
                  <IconAlertTriangle size={16} /> Gemini quyidagilarni topdi:
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {(checkResult.issues || []).map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
                {checkResult.suggestion && (
                  <p className="mt-1.5">
                    <b>Taklif:</b> {checkResult.suggestion}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Savol sozlamalari */}
      <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-surface/70 p-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
            Vaqt chegarasi
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                data-active={q.timeLimit === t}
                onClick={() => onPatch({ timeLimit: t })}
                className="chip"
              >
                {t}s
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ink-soft">Ball</p>
          <div className="flex flex-wrap gap-1.5">
            {POINTS_OPTIONS.map((p) => (
              <button
                key={p.id}
                type="button"
                data-active={q.points === p.id}
                onClick={() => onPatch({ points: p.id })}
                className="chip"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <ul className="mt-4 space-y-1 rounded-xl bg-saffron/15 p-3 text-sm font-semibold text-ink">
          {errors.map((e) => (
            <li key={e} className="flex items-center gap-1.5">
              <IconAlertTriangle size={14} className="shrink-0" /> {e}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}
