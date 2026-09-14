import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { IconBrandTelegram, IconStarFilled, IconX } from '@tabler/icons-react'

const TELEGRAM_CHANNEL_URL = 'https://t.me/kahoot_uz'
const SEEN_KEY = 'kahoot_uz_welcome_seen_v1'

/** Tepadan sirg'alib tushadigan, sahifani to'smaydigan kichik xabar banneri */
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
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="relative z-[60] overflow-hidden border-b border-gold/20 bg-cream-deep/95"
        >
          <div className="section flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-2.5 text-center sm:justify-between sm:text-left">
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <IconStarFilled size={14} className="shrink-0 text-gold" aria-hidden="true" />
              Kahoot UZ'ga xush kelibsiz — yangiliklar uchun kanalga qo'shiling
            </p>

            <div className="flex items-center gap-2">
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-flex !gap-1.5 !px-3 !py-1.5 text-xs"
              >
                <IconBrandTelegram size={15} />
                Kanalga qo'shilish
              </a>
              <button
                type="button"
                onClick={close}
                aria-label="Yopish"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-white/5 hover:text-ink"
              >
                <IconX size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
