import { motion } from 'motion/react'
import { IconStarFilled } from '@tabler/icons-react'

/** "ZIYOBEK TEAM tomonidan yaratildi" — milliy uslubdagi taniqli belgi */
export default function CreatorBadge({ className = '' }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`inline-flex items-center gap-2 rounded-full border-2 border-gold/30 bg-gold/8 px-5 py-2 font-display text-lg font-extrabold tracking-wide text-ink sm:text-xl ${className}`}
    >
      <IconStarFilled size={18} className="shrink-0 text-gold" aria-hidden="true" />
      <span className="text-gold">ZIYOBEK TEAM</span>
      <span className="text-ink-soft">tomonidan yaratildi</span>
    </motion.p>
  )
}
