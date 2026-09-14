import { useState } from 'react'
import { motion } from 'motion/react'
import Mascot from './mascots/Mascot.jsx'
import NaqshPattern from './decor/NaqshPattern.jsx'
import { DEFAULT_CHARACTER } from '../lib/avatarParts.js'
import { fadeUp, inViewOnce } from '../lib/motion.js'

const CARD_NUMBER = '9860606749565028'
const CARD_DISPLAY = CARD_NUMBER.replace(/(.{4})/g, '$1 ').trim()

export default function Donate() {
  const [copied, setCopied] = useState(false)

  async function copyCard() {
    try {
      await navigator.clipboard.writeText(CARD_NUMBER)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard mavjud bo'lmasa jim o'tkazamiz */
    }
  }

  return (
    <section id="donat" className="section py-20">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="card grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:items-center"
      >
        <div>
          <span className="chip" data-active="true">
            💛 Loyihani qo‘llab-quvvatlang
          </span>
          <h2 className="mt-4 text-3xl text-ink sm:text-4xl">
            Kahoot UZ rivojlanishiga hissa qo‘shing
          </h2>
          <p className="mt-4 max-w-lg text-ink-soft">
            Platforma bepul va shunday qolaveradi. Agar loyiha sizga foydali bo‘lsa, server va
            rivojlanish xarajatlariga yordam berishingiz mumkin — har qanday miqdor bizga katta
            ahamiyatga ega.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Mascot character={DEFAULT_CHARACTER} size={64} pose="cheer" />
            <p className="text-sm font-semibold text-ink-soft">Rahmat, siz ajoyibsiz!</p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div
            className="relative overflow-hidden rounded-2xl p-6 text-white shadow-pop"
            style={{
              background: 'linear-gradient(160deg, #1EA5B8 0%, #0E7C9D 55%, #124A5E 100%)',
            }}
          >
            <NaqshPattern id="naqsh-donat" color="#FBF3E4" opacity={0.12} />
            <div className="relative flex items-center justify-between">
              <span className="font-display text-lg font-extrabold">Kahoot UZ</span>
              <span className="text-2xl" aria-hidden="true">
                💳
              </span>
            </div>
            <p className="relative mt-10 select-all font-mono text-2xl font-extrabold tracking-wider sm:text-[1.65rem]">
              {CARD_DISPLAY}
            </p>
            <div className="relative mt-8 flex items-center justify-between text-sm text-white/80">
              <span>ZIYOBEK TEAM</span>
              <span>Humo / Uzcard</span>
            </div>
          </div>

          <button type="button" onClick={copyCard} className="btn-samarkand mt-4 w-full justify-center">
            {copied ? 'Nusxalandi ✓' : 'Karta raqamini nusxalash'}
          </button>
        </div>
      </motion.div>
    </section>
  )
}
