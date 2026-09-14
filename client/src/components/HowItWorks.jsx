import { motion } from 'motion/react'
import { IconDeviceMobile, IconPencil, IconTrophy } from '@tabler/icons-react'
import { fadeUp, stagger, inViewOnce } from '../lib/motion.js'

const steps = [
  {
    n: 1,
    title: 'Viktorina tayyorlang',
    text: 'Savollarni o‘zingiz yozing yoki mavzuni kiriting — Gemini AI yaratib, tekshirib beradi.',
    icon: IconPencil,
  },
  {
    n: 2,
    title: 'PIN kodni ko‘rsating',
    text: 'Ekranda 6 xonali kod chiqadi. O‘quvchilar telefonidan shu kod bilan kiradi.',
    icon: IconDeviceMobile,
  },
  {
    n: 3,
    title: 'Birga o‘ynang',
    text: 'Savollar, taymer, ballar jadvali va g‘olib e’loni — hammasi jonli efirda.',
    icon: IconTrophy,
  },
]

export default function HowItWorks() {
  return (
    <section id="qanday" className="section py-20">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-3xl text-ink sm:text-4xl">Uch qadamda o‘yin</h2>
        <p className="mt-3 text-lg text-ink-soft">Ro‘yxatdan o‘tishdan g‘olibgacha — 5 daqiqa.</p>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="relative mt-14 grid gap-8 md:grid-cols-3"
      >
        <div
          className="absolute left-0 right-0 top-8 hidden h-1 rounded-full md:block"
          style={{
            background:
              'repeating-linear-gradient(90deg, #F5A623 0 14px, transparent 14px 28px)',
          }}
          aria-hidden="true"
        />
        {steps.map((s) => (
          <motion.div key={s.n} variants={fadeUp} className="relative text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gold font-display text-2xl font-extrabold text-white shadow-[0_10px_0_0_var(--color-gold-deep)]">
              {s.n}
            </div>
            <h3 className="mt-5 flex items-center justify-center gap-2 text-xl font-extrabold text-ink">
              <s.icon size={20} className="shrink-0 text-gold" aria-hidden="true" />
              {s.title}
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">{s.text}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
