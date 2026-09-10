import { motion } from 'motion/react'

/**
 * Kahoot UZ qahramoni — parametrik SVG.
 * O'zbek do'ppisi (Chust uslubi), qalampir naqshi va quvnoq yuz bilan.
 *
 * props:
 *  - character: { color, doppiColor, accent }  (yoki alohida color/doppiColor/accent)
 *  - size: piksel (default 180)
 *  - pose: 'idle' | 'wave' | 'cheer'
 *  - float: boolean — yuqori-past tebranish
 */
export default function Mascot({
  character,
  color,
  doppiColor,
  accent,
  size = 180,
  pose = 'idle',
  float = false,
  className = '',
  ...rest
}) {
  const body = color ?? character?.color ?? '#E24A3B'
  const cap = doppiColor ?? character?.doppiColor ?? '#12213A'
  const trim = accent ?? character?.accent ?? '#FBF3E4'

  const leftArmUp = pose === 'cheer'
  const rightArmUp = pose === 'wave' || pose === 'cheer'

  const svg = (
    <svg
      viewBox="0 0 200 234"
      width={size}
      height={size * (234 / 200)}
      className={className}
      role="img"
      aria-label={character?.name ? `${character.name} qahramoni` : 'Kahoot UZ qahramoni'}
      {...rest}
    >
      {/* soya */}
      <ellipse cx="100" cy="222" rx="58" ry="10" fill="#22304A" opacity="0.14" />

      {/* oyoqlar */}
      <ellipse cx="80" cy="210" rx="15" ry="9" fill={cap} />
      <ellipse cx="120" cy="210" rx="15" ry="9" fill={cap} />

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
        <ellipse cx="82" cy="132" rx="13" ry="15" fill="#fff" />
        <ellipse cx="118" cy="132" rx="13" ry="15" fill="#fff" />
        <circle cx="85" cy="134" r="6.2" fill="#12213A" />
        <circle cx="115" cy="134" r="6.2" fill="#12213A" />
        <circle cx="83" cy="131" r="2" fill="#fff" />
        <circle cx="113" cy="131" r="2" fill="#fff" />
      </g>

      {/* yonoqlar */}
      <ellipse cx="64" cy="152" rx="9" ry="6" fill={trim} opacity="0.75" />
      <ellipse cx="136" cy="152" rx="9" ry="6" fill={trim} opacity="0.75" />

      {/* tabassum */}
      <path d="M82 156 Q100 180 118 156 Q100 170 82 156 Z" fill="#12213A" />
      <path d="M96 168 Q100 174 104 168 Z" fill="#E24A3B" />

      {/* ---- Chust do'ppisi ---- */}
      {/* gumbaz */}
      <path
        d="M52 66 C52 26 74 8 100 8 C126 8 148 26 148 66 Z"
        fill={cap}
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="2"
      />
      {/* asos tasmasi */}
      <path d="M46 64 H154 V78 C154 84 150 88 144 88 H56 C50 88 46 84 46 78 Z" fill={cap} />
      {/* qalampir naqshlari */}
      <g fill={trim}>
        <path d="M100 22 C104 27 105 33 101 37 C97 41 92 39 91 34 C90 29 94 25 100 22 Z" />
        <path d="M72 34 C77 37 79 43 76 47 C73 51 68 49 67 44 C66 39 68 36 72 34 Z" />
        <path d="M128 34 C123 37 121 43 124 47 C127 51 132 49 133 44 C134 39 132 36 128 34 Z" />
      </g>
      {/* asos naqshi — kamon-kamon */}
      <path
        d="M50 82 Q56 74 62 82 T74 82 T86 82 T98 82 T110 82 T122 82 T134 82 T146 82"
        stroke={trim}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
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
