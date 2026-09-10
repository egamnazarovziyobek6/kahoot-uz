import AnswerShape from './AnswerShape.jsx'

/**
 * Bitta javob varianti (viktorina / ko‘p javobli / to‘g‘ri-noto‘g‘ri uchun).
 */
export default function AnswerTile({
  answer,
  style,
  qtype,
  index,
  onText,
  onToggleCorrect,
  onRemove,
  canRemove,
}) {
  const fixedText = qtype === 'truefalse'
  const multi = qtype === 'multi'

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-3 transition-colors ${
        answer.correct ? 'border-chaman bg-chaman/5' : 'border-black/10'
      }`}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
        style={{ background: style.color }}
      >
        <AnswerShape shape={style.shape} size={18} />
      </span>

      {fixedText ? (
        <span className="flex-1 font-display text-base font-extrabold text-ink">{answer.text}</span>
      ) : (
        <input
          value={answer.text}
          onChange={(e) => onText(e.target.value)}
          placeholder={`Javob ${index + 1}${index > 1 ? ' (ixtiyoriy)' : ''}`}
          className="flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-soft/45"
        />
      )}

      <button
        type="button"
        onClick={onToggleCorrect}
        aria-pressed={answer.correct}
        title={answer.correct ? 'To‘g‘ri javob' : 'To‘g‘ri deb belgilash'}
        className={`grid h-8 w-8 shrink-0 place-items-center border-2 transition-colors ${
          multi ? 'rounded-md' : 'rounded-full'
        } ${
          answer.correct
            ? 'border-chaman bg-chaman text-white'
            : 'border-black/20 bg-white text-transparent hover:border-chaman'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {!fixedText && (
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          title="Variantni o‘chirish"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-anor/10 hover:text-anor disabled:cursor-not-allowed disabled:opacity-25"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
