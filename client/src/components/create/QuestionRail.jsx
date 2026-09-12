import { useState } from 'react'
import { QUESTION_TYPES } from '../../lib/quiz.js'

function AddMenu({ onAdd }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-samarkand w-full !py-2.5 text-sm"
      >
        + Savol qo‘shish
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full z-20 mb-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-[0_18px_40px_-12px_rgba(34,48,74,0.35)]">
            {Object.entries(QUESTION_TYPES).map(([key, t]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onAdd(key)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-cream"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-samarkand/12 text-sm">
                  {t.icon}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{t.label}</span>
                  <span className="block text-xs text-ink-soft">{t.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function QuestionRail({
  questions,
  selectedId,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onMove,
  errorsByIndex = [],
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-surface/70 md:flex">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="font-display text-sm font-extrabold text-ink">
          Savollar <span className="text-ink-soft">({questions.length})</span>
        </p>
      </div>

      <ol className="flex-1 space-y-2 overflow-y-auto p-3">
        {questions.map((q, i) => {
          const active = q.id === selectedId
          const hasErrors = (errorsByIndex[i]?.length ?? 0) > 0
          return (
            <li key={q.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(q.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(q.id)}
                className={`group cursor-pointer rounded-xl border-2 p-2.5 transition-colors ${
                  active
                    ? 'border-samarkand bg-samarkand/8'
                    : 'border-transparent bg-surface hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-extrabold text-ink-soft">
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-ink/8">
                      {i + 1}
                    </span>
                    {QUESTION_TYPES[q.type]?.label ?? q.type}
                  </span>
                  {hasErrors && (
                    <span
                      className="h-2 w-2 rounded-full bg-saffron"
                      title="To‘ldirilmagan maydonlar bor"
                    />
                  )}
                </div>

                <p className="mt-1.5 line-clamp-2 text-sm text-ink">
                  {q.text.trim() || <span className="text-ink-soft/60">Savol matni…</span>}
                </p>

                <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-ink-soft">
                  <span>{q.timeLimit}s</span>
                  <span>•</span>
                  <span>
                    {q.points === 'double'
                      ? '2× ball'
                      : q.points === 'none'
                        ? 'ballsiz'
                        : 'ball'}
                  </span>
                </div>

                <div className="mt-2 hidden items-center gap-1 group-hover:flex">
                  <RailIcon
                    title="Yuqoriga"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMove(q.id, -1)
                    }}
                  >
                    ↑
                  </RailIcon>
                  <RailIcon
                    title="Pastga"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMove(q.id, 1)
                    }}
                  >
                    ↓
                  </RailIcon>
                  <RailIcon
                    title="Nusxa olish"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicate(q.id)
                    }}
                  >
                    ⧉
                  </RailIcon>
                  <RailIcon
                    title="O‘chirish"
                    danger
                    disabled={questions.length <= 1}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(q.id)
                    }}
                  >
                    ✕
                  </RailIcon>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="border-t border-white/10 p-3">
        <AddMenu onAdd={onAdd} />
      </div>
    </aside>
  )
}

function RailIcon({ children, onClick, title, danger, disabled }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-surface text-xs transition-colors disabled:opacity-25 ${
        danger ? 'hover:border-anor hover:text-anor' : 'hover:border-samarkand hover:text-samarkand'
      }`}
    >
      {children}
    </button>
  )
}
