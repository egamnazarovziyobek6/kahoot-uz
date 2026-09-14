import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconArrowDown, IconArrowUp, IconCopy, IconX } from '@tabler/icons-react'
import { QUESTION_TYPES } from '../../lib/quiz.js'

function AddMenu({ onAdd }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-gold w-full !py-2.5 text-sm"
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
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/12 text-gold">
                  <t.icon size={16} />
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
  open = false,
  onClose,
}) {
  function selectAndClose(qid) {
    onSelect(qid)
    onClose?.()
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 bg-ink/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r border-white/10 bg-surface shadow-2xl transition-transform duration-300 ease-out md:static md:z-auto md:w-64 md:max-w-none md:translate-x-0 md:shadow-none md:transition-none md:flex ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="font-display text-sm font-extrabold text-ink">
            Savollar <span className="text-ink-soft">({questions.length})</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-ink-soft hover:bg-black/5 md:hidden"
            title="Yopish"
          >
            <IconX size={16} />
          </button>
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
                  onClick={() => selectAndClose(q.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && selectAndClose(q.id)}
                className={`group cursor-pointer rounded-xl border-2 p-2.5 transition-colors ${
                  active
                    ? 'border-gold bg-gold/8'
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

                <div className="mt-2 flex items-center gap-1.5">
                  <RailIcon
                    title="Yuqoriga"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMove(q.id, -1)
                    }}
                  >
                    <IconArrowUp size={14} />
                  </RailIcon>
                  <RailIcon
                    title="Pastga"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMove(q.id, 1)
                    }}
                  >
                    <IconArrowDown size={14} />
                  </RailIcon>
                  <RailIcon
                    title="Nusxa olish"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicate(q.id)
                    }}
                  >
                    <IconCopy size={14} />
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
                    <IconX size={14} />
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
    </>
  )
}

function RailIcon({ children, onClick, title, danger, disabled }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-surface text-xs transition-colors disabled:opacity-25 ${
        danger ? 'hover:border-anor hover:text-anor' : 'hover:border-gold hover:text-gold'
      }`}
    >
      {children}
    </button>
  )
}
