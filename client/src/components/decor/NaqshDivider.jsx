/** Suzana kashtasidan ilhomlangan bo'linuvchi bezak chizig'i */
export default function NaqshDivider({ className = '', flip = false }) {
  return (
    <div className={`w-full overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 44"
        preserveAspectRatio="none"
        className="h-9 w-full"
        style={flip ? { transform: 'scaleY(-1)' } : undefined}
      >
        <defs>
          <pattern id="naqsh-band" width="72" height="44" patternUnits="userSpaceOnUse">
            <path d="M0 36 Q36 2 72 36" fill="none" stroke="#F5A623" strokeWidth="3" />
            <path d="M0 36 Q36 14 72 36" fill="none" stroke="#0E7C9D" strokeWidth="2.4" />
            <circle cx="36" cy="9" r="3.4" fill="#E24A3B" />
            <circle cx="4" cy="38" r="2.4" fill="#2B3A8C" />
            <circle cx="68" cy="38" r="2.4" fill="#2B3A8C" />
            <path d="M36 20 l4 5 -4 5 -4 -5 z" fill="#1B7A4B" />
          </pattern>
        </defs>
        <rect width="1200" height="44" fill="url(#naqsh-band)" />
      </svg>
    </div>
  )
}
