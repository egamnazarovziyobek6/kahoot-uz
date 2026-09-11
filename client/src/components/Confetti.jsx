import { useState } from 'react'
import { motion } from 'motion/react'

const COLORS = ['#E24A3B', '#F5A623', '#1B7A4B', '#0E7C9D', '#2B3A8C']

/** O'yin yakunida yog'iladigan yengil konfetti — milliy ranglarda, CSS-only jismoniyat */
export default function Confetti({ count = 26 }) {
  // Lazy initializer: tasodifiy qiymatlar faqat birinchi render'da hisoblanadi (impure emas)
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.4 + Math.random() * 1.6,
      color: COLORS[i % COLORS.length],
      rotate: Math.random() * 360,
      size: 7 + Math.random() * 6,
    })),
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: '-10%', x: `${p.left}vw`, opacity: 0, rotate: 0 }}
          animate={{ y: '110%', opacity: [0, 1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            top: 0,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  )
}
