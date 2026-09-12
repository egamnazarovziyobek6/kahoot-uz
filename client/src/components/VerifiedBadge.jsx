/** X(Twitter)dagi ko'k tasdiqlash belgisiga o'xshash — admin tomonidan tasdiqlangan o'qituvchilar uchun */
export default function VerifiedBadge({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label="Tasdiqlangan o'qituvchi"
      title="Tasdiqlangan o'qituvchi"
    >
      <path
        fill="#33E0E8"
        d="M12 2l2.4 1.9 3-.6 1.1 2.9 2.9 1.1-.6 3L22 12l-1.9 2.4.6 3-2.9 1.1-1.1 2.9-3-.6L12 22l-2.4-1.9-3 .6-1.1-2.9-2.9-1.1.6-3L2 12l1.9-2.4-.6-3 2.9-1.1 1.1-2.9 3 .6z"
      />
      <path fill="#06232a" d="M10.2 15.4 7 12.2l1.2-1.2 2 2 5.6-5.6 1.2 1.2z" />
    </svg>
  )
}
