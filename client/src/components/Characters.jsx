import { motion } from 'motion/react'
import Mascot from './mascots/Mascot.jsx'
import NaqshPattern from './decor/NaqshPattern.jsx'
import { characters } from '../lib/characters.js'
import { fadeUp, stagger, inViewOnce } from '../lib/motion.js'

export default function Characters() {
  return (
    <section id="qahramonlar" className="relative overflow-hidden bg-surface/60 py-20">
      <NaqshPattern color="#2B3A8C" opacity={0.05} />

      <div className="section relative">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl text-ink sm:text-4xl">Kahoot UZ qahramonlari</h2>
          <p className="mt-3 text-lg text-ink-soft">
            Har biri milliy do‘ppisi va o‘z fe’li bilan. O‘yin boshida qahramoningizni tanlang.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {characters.map((c, i) => (
            <motion.div
              key={c.id}
              variants={fadeUp}
              className="group card items-center text-center"
              whileHover="hover"
            >
              <motion.div
                variants={{ hover: { rotate: [0, -6, 6, 0], y: -8 } }}
                transition={{ duration: 0.6 }}
                className="mx-auto"
              >
                <Mascot
                  character={c}
                  size={150}
                  pose={i % 2 === 0 ? 'wave' : 'idle'}
                />
              </motion.div>
              <h3 className="mt-2 font-display text-xl font-extrabold text-ink">{c.name}</h3>
              <p
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: c.color }}
              >
                {c.role}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.blurb}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
