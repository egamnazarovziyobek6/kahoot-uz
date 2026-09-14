import { useRef, useState } from 'react'

const WIDTH = 320
const HEIGHT = 110
const PAD_TOP = 12
const PAD_BOTTOM = 18

function fmtShort(dayStr) {
  const d = new Date(`${dayStr}T00:00:00Z`)
  return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

/** So'nggi N kunlik kundalik sonlarni chiziq+maydon grafigi sifatida ko'rsatadi */
export default function TrendChart({ data, color, label }) {
  const svgRef = useRef(null)
  const [hoverIndex, setHoverIndex] = useState(null)

  const max = Math.max(1, ...data.map((d) => d.count))
  const stepX = WIDTH / Math.max(1, data.length - 1)
  const yFor = (count) => PAD_TOP + (1 - count / max) * (HEIGHT - PAD_TOP - PAD_BOTTOM)
  const points = data.map((d, i) => [i * stepX, yFor(d.count)])
  const baseline = HEIGHT - PAD_BOTTOM

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')
  const last = points[points.length - 1]
  const areaPath = `${linePath} L ${last[0].toFixed(1)} ${baseline} L ${points[0][0].toFixed(1)} ${baseline} Z`

  const total = data.reduce((s, d) => s + d.count, 0)

  function handleMove(e) {
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH
    setHoverIndex(Math.max(0, Math.min(data.length - 1, Math.round(x / stepX))))
  }

  const hovered = hoverIndex != null ? data[hoverIndex] : null
  const hoverPoint = hoverIndex != null ? points[hoverIndex] : null

  return (
    <div className="card">
      <p className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-ink">{total}</p>
      <p className="text-xs text-ink-soft">so‘nggi {data.length} kunda</p>

      <div className="relative mt-3">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <line
            x1={0}
            y1={baseline}
            x2={WIDTH}
            y2={baseline}
            stroke="currentColor"
            className="text-ink-soft/20"
            strokeWidth="1"
          />

          <path d={areaPath} fill={color} opacity="0.1" stroke="none" />
          <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          <circle cx={last[0]} cy={last[1]} r="5" fill={color} stroke="var(--color-surface)" strokeWidth="2" />
          <text
            x={Math.min(WIDTH - 4, last[0] + 6)}
            y={Math.max(10, last[1] - 6)}
            textAnchor="end"
            className="fill-ink text-[9px] font-bold"
          >
            {data[data.length - 1].count}
          </text>

          {hoverPoint && (
            <>
              <line
                x1={hoverPoint[0]}
                y1={PAD_TOP}
                x2={hoverPoint[0]}
                y2={baseline}
                stroke="currentColor"
                className="text-ink-soft/30"
                strokeWidth="1"
              />
              <circle
                cx={hoverPoint[0]}
                cy={hoverPoint[1]}
                r="4"
                fill={color}
                stroke="var(--color-surface)"
                strokeWidth="2"
              />
            </>
          )}

          <text x={2} y={HEIGHT - 4} className="fill-ink-soft text-[8px]">
            {fmtShort(data[0].day)}
          </text>
          <text x={WIDTH - 2} y={HEIGHT - 4} textAnchor="end" className="fill-ink-soft text-[8px]">
            {fmtShort(data[data.length - 1].day)}
          </text>
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+6px)] whitespace-nowrap rounded-lg border border-white/10 bg-cream-deep px-2 py-1 text-xs font-bold text-ink shadow-lg"
            style={{ left: `${(hoverPoint[0] / WIDTH) * 100}%`, top: `${(hoverPoint[1] / HEIGHT) * 100}%` }}
          >
            <span className="font-normal text-ink-soft">{fmtShort(hovered.day)}</span> · {hovered.count}
          </div>
        )}
      </div>
    </div>
  )
}
