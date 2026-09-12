import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Mascot from './mascots/Mascot.jsx'
import { characters } from '../lib/characters.js'
import { popIn } from '../lib/motion.js'

// TODO: haqiqiy Telegram kanal manzilini shu yerga qo'ying
const TELEGRAM_CHANNEL_URL = 'https://t.me/kahoot_uz'

const SEEN_KEY = 'kahoot_uz_welcome_seen_v1'

export default function WelcomeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setOpen(true)
    } catch {
      /* localStorage yo'q bo'lsa ham sahifa ishlashda davom etadi */
    }
  }, [])

  function close() {
    setOpen(false)
    try {
      localStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* xotira yo'q bo'lsa ham jim o'tkazamiz */
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            variants={popIn}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-surface p-6 text-center shadow-pop sm:p-8"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Yopish"
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-surface-soft text-ink-soft hover:text-ink"
            >
              ✕
            </button>

            <div className="mx-auto -mt-2 mb-2 flex justify-center gap-1">
              <Mascot character={characters[0]} size={64} pose="wave" />
              <Mascot character={characters[4]} size={64} pose="cheer" />
            </div>

            <h2 className="font-display text-xl font-extrabold text-ink sm:text-2xl">
              Kahoot UZ'ga xush kelibsiz! 👋
            </h2>
            <p className="mt-2 text-sm font-bold text-samarkand-light">
              ⭐ ZIYOBEK TEAM tomonidan yaratildi
            </p>

            <p className="mt-4 text-sm text-ink-soft">
              Platforma butunlay bepul va shunday qolaveradi. Agar loyiha sizga foydali bo'lsa,
              server xarajatlariga{' '}
              <a href="#donat" onClick={close} className="font-bold text-saffron underline">
                homiylik qilib
              </a>{' '}
              qo'llab-quvvatlashingiz mumkin.
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-surface-soft p-4 text-left">
              <p className="text-sm font-extrabold text-ink">📣 Yangiliklardan xabardor bo'ling</p>
              <p className="mt-1 text-xs text-ink-soft">
                Yangi funksiyalar, testlar va yangilanishlar haqida birinchilardan bo'lib bilish
                uchun Telegram kanalimizga a'zo bo'ling.
              </p>
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-samarkand mt-3 w-full justify-center text-sm"
              >
                📲 Telegram kanalga a'zo bo'lish
              </a>
            </div>

            <button type="button" onClick={close} className="btn-ghost mt-4 w-full justify-center">
              Davom etish
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
