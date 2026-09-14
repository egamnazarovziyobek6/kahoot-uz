import { motion } from 'motion/react'

const CAP_COLOR = '#12213A'
const TRIM_COLOR = '#FBF3E4'

function Face({ face }) {
  switch (face) {
    case 'tinch':
      return (
        <>
          <circle cx="82" cy="133" r="6" fill="#12213A" />
          <circle cx="118" cy="133" r="6" fill="#12213A" />
          <path d="M86 160 Q100 166 114 160" stroke="#12213A" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      )
    case 'salqin':
      return (
        <>
          <rect x="66" y="122" width="68" height="18" rx="9" fill="#12213A" />
          <path d="M74 128 Q100 132 126 128" stroke="#ffffff" strokeWidth="2.5" opacity="0.35" fill="none" />
          <path d="M88 160 Q100 165 112 160" stroke="#12213A" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      )
    case 'ajablanish':
      return (
        <>
          <circle cx="82" cy="133" r="12" fill="#fff" />
          <circle cx="118" cy="133" r="12" fill="#fff" />
          <circle cx="82" cy="135" r="5.5" fill="#12213A" />
          <circle cx="118" cy="135" r="5.5" fill="#12213A" />
          <ellipse cx="100" cy="162" rx="9" ry="11" fill="#12213A" />
        </>
      )
    case 'qatiy':
      return (
        <>
          <path d="M72 120 L92 126" stroke="#12213A" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M128 120 L108 126" stroke="#12213A" strokeWidth="4.5" strokeLinecap="round" />
          <ellipse cx="82" cy="136" rx="9" ry="7" fill="#12213A" />
          <ellipse cx="118" cy="136" rx="9" ry="7" fill="#12213A" />
          <path d="M84 162 H116" stroke="#12213A" strokeWidth="4.5" strokeLinecap="round" />
        </>
      )
    case 'tabassum':
    default:
      return (
        <>
          <ellipse cx="82" cy="132" rx="13" ry="15" fill="#fff" />
          <ellipse cx="118" cy="132" rx="13" ry="15" fill="#fff" />
          <circle cx="85" cy="134" r="6.2" fill="#12213A" />
          <circle cx="115" cy="134" r="6.2" fill="#12213A" />
          <circle cx="83" cy="131" r="2" fill="#fff" />
          <circle cx="113" cy="131" r="2" fill="#fff" />
          <path d="M82 156 Q100 180 118 156 Q100 170 82 156 Z" fill="#12213A" />
        </>
      )
  }
}

function Hat({ hat }) {
  if (hat === 'none') return null

  if (hat === 'cap') {
    return (
      <g>
        <path
          d="M56 64 C56 34 74 14 100 14 C126 14 144 34 144 64 Z"
          fill={CAP_COLOR}
          stroke={TRIM_COLOR}
          strokeWidth="2"
          strokeOpacity="0.5"
        />
        <path
          d="M96 14 C122 14 140 32 143 58 L166 56 C168 50 160 44 150 46 C142 30 122 18 100 18 Z"
          fill={CAP_COLOR}
          stroke={TRIM_COLOR}
          strokeWidth="1.6"
          strokeOpacity="0.5"
        />
        <path d="M62 62 Q100 52 138 62" stroke={TRIM_COLOR} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.8" />
        <circle cx="100" cy="16" r="5" fill={TRIM_COLOR} />
      </g>
    )
  }

  if (hat === 'headband') {
    return (
      <g>
        <path
          d="M48 78 Q100 54 152 78 L152 66 Q100 42 48 66 Z"
          fill={CAP_COLOR}
          stroke={TRIM_COLOR}
          strokeWidth="2"
          strokeOpacity="0.6"
        />
        <path d="M54 71 Q100 50 146 71" stroke={TRIM_COLOR} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
        <circle cx="134" cy="68" r="7" fill={TRIM_COLOR} />
      </g>
    )
  }

  // do'ppi (Chust uslubi) — standart milliy tanlov
  return (
    <g>
      <path
        d="M52 66 C52 26 74 8 100 8 C126 8 148 26 148 66 Z"
        fill={CAP_COLOR}
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="2"
      />
      <path d="M46 64 H154 V78 C154 84 150 88 144 88 H56 C50 88 46 84 46 78 Z" fill={CAP_COLOR} />
      <g fill={TRIM_COLOR}>
        <path d="M100 22 C104 27 105 33 101 37 C97 41 92 39 91 34 C90 29 94 25 100 22 Z" />
        <path d="M72 34 C77 37 79 43 76 47 C73 51 68 49 67 44 C66 39 68 36 72 34 Z" />
        <path d="M128 34 C123 37 121 43 124 47 C127 51 132 49 133 44 C134 39 132 36 128 34 Z" />
      </g>
      <path
        d="M50 82 Q56 74 62 82 T74 82 T86 82 T98 82 T110 82 T122 82 T134 82 T146 82"
        stroke={TRIM_COLOR}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}

/**
 * Kahoot UZ qahramoni — parametrik SVG.
 * Foydalanuvchi rangni, bosh kiyimni va yuzni alohida tanlab yasaydi.
 *
 * props:
 *  - character: { color, hat, face }  (yoki alohida color/hat/face)
 *  - size: piksel (default 180)
 *  - pose: 'idle' | 'wave' | 'cheer'
 *  - float: boolean — yuqori-past tebranish
 */
export default function Mascot({
  character,
  color,
  hat,
  face,
  size = 180,
  pose = 'idle',
  float = false,
  className = '',
  style: styleProp,
  ...rest
}) {
  const body = color ?? character?.color ?? '#FF4D5E'
  const hatId = hat ?? character?.hat ?? 'doppi'
  const faceId = face ?? character?.face ?? 'tabassum'

  const leftArmUp = pose === 'cheer'
  const rightArmUp = pose === 'wave' || pose === 'cheer'

  const svg = (
    <svg
      viewBox="0 0 200 234"
      width={size}
      height={size * (234 / 200)}
      className={className}
      role="img"
      aria-label="Kahoot UZ qahramoni"
      {...rest}
      style={{ filter: `drop-shadow(0 0 14px ${body}55)`, ...styleProp }}
    >
      {/* soya */}
      <ellipse cx="100" cy="222" rx="58" ry="10" fill="#22304A" opacity="0.14" />

      {/* oyoqlar */}
      <ellipse cx="80" cy="210" rx="15" ry="9" fill={CAP_COLOR} />
      <ellipse cx="120" cy="210" rx="15" ry="9" fill={CAP_COLOR} />

      {/* chap qo'l */}
      <motion.path
        d={leftArmUp ? 'M46 150 C24 132 20 108 30 92' : 'M46 150 C30 160 24 176 30 190'}
        stroke={body}
        strokeWidth="17"
        strokeLinecap="round"
        fill="none"
        animate={leftArmUp ? { rotate: [0, -14, 0] } : {}}
        transition={{ repeat: Infinity, duration: 1.7, ease: 'easeInOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: '90% 90%' }}
      />
      {/* o'ng qo'l */}
      <motion.path
        d={rightArmUp ? 'M154 150 C176 132 180 106 170 90' : 'M154 150 C170 160 176 176 170 190'}
        stroke={body}
        strokeWidth="17"
        strokeLinecap="round"
        fill="none"
        animate={rightArmUp ? { rotate: [0, 16, 0] } : {}}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: '10% 90%' }}
      />

      {/* tana */}
      <path
        d="M100 60 C148 60 166 96 166 140 C166 190 138 210 100 210 C62 210 34 190 34 140 C34 96 52 60 100 60 Z"
        fill={body}
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="3"
      />
      {/* qorin yorug'ligi */}
      <ellipse cx="100" cy="158" rx="40" ry="44" fill="#fff" opacity="0.16" />

      {/* yuz */}
      <g className="mascot-eyes">
        <Face face={faceId} />
      </g>

      <Hat hat={hatId} />
    </svg>
  )

  if (!float) return svg

  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }}
      style={{ display: 'inline-block', lineHeight: 0 }}
    >
      {svg}
    </motion.div>
  )
}
