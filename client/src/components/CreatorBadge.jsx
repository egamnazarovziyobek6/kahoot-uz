import { motion } from 'motion/react'

/** "ZIYOBEK TEAM tomonidan yaratildi" — katta shriftli, milliy uslubdagi taniqli belgi */
export default function CreatorBadge({ className = '' }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`inline-flex items-center gap-2 rounded-full border-2 border-saffron/40 bg-gradient-to-r from-anor/10 via-saffron/15 to-samarkand/10 px-5 py-2 font-display text-lg font-extrabold tracking-wide text-ink sm:text-xl ${className}`}
    >
      <motion.span
        animate={{ rotate: [0, 14, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        ⭐
      </motion.span>
      <span
        className="bg-gradient-to-r from-anor via-saffron-light to-samarkand bg-clip-text text-transparent"
      >
        ZIYOBEK TEAM
      </span>
      <span className="text-ink-soft">tomonidan yaratildi</span>
    </motion.p>
  )
}
