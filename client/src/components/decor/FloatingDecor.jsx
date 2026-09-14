import { motion } from 'motion/react'
import Star8 from './Star8.jsx'

const items = [
  { c: <Star8 size={50} color="#e0a93e" />, top: '8%', left: '4%', d: 6, sm: true, o: 0.5 },
  { c: <Star8 size={30} color="#8b8f9c" />, top: '62%', left: '8%', d: 5.5, o: 0.3 },
  { c: <Star8 size={36} color="#e0a93e" />, bottom: '10%', right: '10%', d: 6.8, o: 0.35 },
  { c: <Star8 size={22} color="#8b8f9c" />, top: '40%', right: '3%', d: 5, o: 0.3 },
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
          className={`absolute ${it.sm ? 'hidden sm:block' : ''}`}
          style={{ top: it.top, left: it.left, right: it.right, bottom: it.bottom, opacity: it.o }}
          animate={{ y: [0, -18, 0], rotate: [0, i % 2 ? 8 : -8, 0] }}
          transition={{ repeat: Infinity, duration: it.d, ease: 'easeInOut' }}
        >
          {it.c}
        </motion.div>
      ))}
    </div>
  )
}
