/** Forumning o'z hissiyot ikonalari — unicode emoji emas, chizilgan SVG (Facebook reaksiyalariga o'xshash) */
const FACE = {
  like: { fill: '#33E0E8', ring: '#0a6b78' },
  love: { fill: '#FF4D5E', ring: '#c22c3d' },
  haha: { fill: '#F5A623', ring: '#b8791a' },
  wow: { fill: '#F5A623', ring: '#b8791a' },
  sad: { fill: '#F5A623', ring: '#b8791a' },
  angry: { fill: '#FF4D5E', ring: '#c22c3d' },
}

export const REACTION_LABELS = {
  like: 'Yoqdi',
  love: 'Ajoyib',
  haha: 'Kulgili',
  wow: 'Ajablanarli',
  sad: "Xafa bo'ldim",
  angry: "G'azablandim",
}

function Face({ children, color }) {
  return (
    <>
      <circle cx="12" cy="12" r="10" fill={color.fill} stroke={color.ring} strokeWidth="1" />
      {children}
    </>
  )
}

export default function ReactionIcon({ type, size = 18, className = '' }) {
  const color = FACE[type] || FACE.like

  const face = {
    like: (
      <path
        d="M9.5 8.5 C10.5 6, 13.5 6, 13.5 9 L13.5 10.5 L16 10.5 C17 10.5 17.3 11.5 16.8 12.3 L15.3 16.2 C15 17 14.3 17.5 13.4 17.5 L8.5 17.5 C7.7 17.5 7 16.8 7 16 L7 11.5 C7 10.9 7.2 10.4 7.6 10 Z"
        fill="#fff"
      />
    ),
    love: (
      <path
        d="M12 17.3 C9 15 6.7 13 6.7 10.6 C6.7 8.8 8.1 7.5 9.7 7.5 C10.7 7.5 11.5 8 12 8.7 C12.5 8 13.3 7.5 14.3 7.5 C15.9 7.5 17.3 8.8 17.3 10.6 C17.3 13 15 15 12 17.3 Z"
        fill="#fff"
      />
    ),
    haha: (
      <>
        <path d="M7.5 10 Q8.5 8.5 9.5 10" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M14.5 10 Q15.5 8.5 16.5 10" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M7 13.5 Q12 19 17 13.5 Z" fill="#fff" />
      </>
    ),
    wow: (
      <>
        <circle cx="8.5" cy="10.5" r="1.3" fill="#fff" />
        <circle cx="15.5" cy="10.5" r="1.3" fill="#fff" />
        <ellipse cx="12" cy="16" rx="2.2" ry="2.8" fill="#fff" />
      </>
    ),
    sad: (
      <>
        <path d="M7.5 10.5 Q8.5 9.3 9.5 10.5" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M14.5 10.5 Q15.5 9.3 16.5 10.5" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M8.5 17.5 Q12 14 15.5 17.5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M16 12.5 Q17.3 13 17 15" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </>
    ),
    angry: (
      <>
        <path d="M7.3 9.3 L10 10.6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16.7 9.3 L14 10.6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="11.3" r="1.1" fill="#fff" />
        <circle cx="15" cy="11.3" r="1.1" fill="#fff" />
        <path d="M8.5 17 Q12 14.5 15.5 17" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </>
    ),
  }[type] || null

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <Face color={color}>{face}</Face>
    </svg>
  )
}
