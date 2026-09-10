/** To'liq fon uchun suzana naqshi qatlami. Ota-element `position: relative` bo'lsin. */
export default function NaqshPattern({
  color = '#0E7C9D',
  opacity = 0.06,
  className = '',
  id = 'naqsh-suzana',
}) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
      style={{ color }}
    >
      <defs>
        <pattern id={id} width="132" height="132" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="66" cy="66" r="15" />
            <g>
              <path d="M66 40 C72 50 72 56 66 62 C60 56 60 50 66 40 Z" fill="currentColor" stroke="none" />
              <path d="M66 92 C72 82 72 76 66 70 C60 76 60 82 66 92 Z" fill="currentColor" stroke="none" />
              <path d="M40 66 C50 72 56 72 62 66 C56 60 50 60 40 66 Z" fill="currentColor" stroke="none" />
              <path d="M92 66 C82 72 76 72 70 66 C76 60 82 60 92 66 Z" fill="currentColor" stroke="none" />
            </g>
            <circle cx="0" cy="0" r="6" />
            <circle cx="132" cy="0" r="6" />
            <circle cx="0" cy="132" r="6" />
            <circle cx="132" cy="132" r="6" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  )
}
