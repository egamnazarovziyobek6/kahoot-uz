/** Javob varianti belgisi — Kahoot uslubidagi shakllar */
export default function AnswerShape({ shape = 'triangle', size = 20, className = '' }) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    className,
    'aria-hidden': true,
  }
  switch (shape) {
    case 'diamond':
      return (
        <svg {...p}>
          <path d="M12 2 22 12 12 22 2 12Z" />
        </svg>
      )
    case 'circle':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
    case 'square':
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
        </svg>
      )
    case 'triangle':
    default:
      return (
        <svg {...p}>
          <path d="M12 3 22 21 2 21Z" />
        </svg>
      )
  }
}
