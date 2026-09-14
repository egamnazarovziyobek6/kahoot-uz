import Mascot from './mascots/Mascot.jsx'
import { BODY_COLORS, HATS, FACES } from '../lib/avatarParts.js'

/**
 * Kahoot uslubidagi qahramon konstruktori — rang, bosh kiyim va yuzni
 * alohida tanlab, o'z qahramonini yasash.
 *
 * props: value={{color,hat,face}}, onChange(next)
 */
export default function QahramonBuilder({ value, onChange, previewSize = 140 }) {
  const patch = (p) => onChange({ ...value, ...p })

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid h-full place-items-center">
        <Mascot character={value} size={previewSize} pose="idle" />
      </div>

      <div className="w-full space-y-3">
        <Group label="Rang">
          {BODY_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.label}
              aria-pressed={value.color === c.value}
              onClick={() => patch({ color: c.value })}
              className="h-9 w-9 shrink-0 rounded-full border-2 transition-transform"
              style={{
                background: c.value,
                borderColor: value.color === c.value ? '#fff' : 'transparent',
                boxShadow: value.color === c.value ? `0 0 0 2px ${c.value}` : 'none',
                transform: value.color === c.value ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          ))}
        </Group>

        <Group label="Bosh kiyim">
          {HATS.map((h) => (
            <button
              key={h.id}
              type="button"
              data-active={value.hat === h.id}
              onClick={() => patch({ hat: h.id })}
              className="chip"
            >
              {h.label}
            </button>
          ))}
        </Group>

        <Group label="Yuz">
          {FACES.map((f) => (
            <button
              key={f.id}
              type="button"
              data-active={value.face === f.id}
              onClick={() => patch({ face: f.id })}
              className="chip"
            >
              {f.label}
            </button>
          ))}
        </Group>
      </div>
    </div>
  )
}

function Group({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</p>
      <div className="flex flex-wrap justify-center gap-2">{children}</div>
    </div>
  )
}
