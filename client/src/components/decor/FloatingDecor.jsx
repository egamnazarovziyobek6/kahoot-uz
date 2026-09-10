import { motion } from 'motion/react'
import Star8 from './Star8.jsx'
import Anor from './Anor.jsx'

const items = [
  { c: <Star8 size={54} color="#F5A623" />, top: '8%', left: '4%', d: 6, sm: true },
  { c: <Anor size={58} />, top: '18%', right: '6%', d: 7.5, sm: true },
  { c: <Star8 size={34} color="#1EA5B8" />, top: '62%', left: '8%', d: 5.5 },
  { c: <Star8 size={40} color="#E24A3B" />, bottom: '10%', right: '10%', d: 6.8 },
  { c: <Anor size={38} />, bottom: '18%', left: '16%', d: 8.2, sm: true },
  { c: <Star8 size={26} color="#2B3A8C" />, top: '40%', right: '3%', d: 5 },
]

export default function FloatingDecor({ className = '' }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {items.map((it, i) => (
        <motion.div
          key={i}
          className={`absolute drop-shadow-sm ${it.sm ? 'hidden sm:block' : ''}`}
          style={{ top: it.top, left: it.left, right: it.right, bottom: it.bottom }}
          animate={{ y: [0, -18, 0], rotate: [0, i % 2 ? 8 : -8, 0] }}
          transition={{ repeat: Infinity, duration: it.d, ease: 'easeInOut' }}
        >
          {it.c}
        </motion.div>
      ))}
    </div>
  )
}
