import { useState } from 'react'
import { motion } from 'motion/react'
import QahramonBuilder from './QahramonBuilder.jsx'
import NaqshPattern from './decor/NaqshPattern.jsx'
import { DEFAULT_CHARACTER } from '../lib/avatarParts.js'
import { fadeUp, inViewOnce } from '../lib/motion.js'

export default function Characters() {
  const [demo, setDemo] = useState(DEFAULT_CHARACTER)

  return (
    <section id="qahramonlar" className="relative overflow-hidden bg-surface/60 py-20">
      <NaqshPattern color="#2B3A8C" opacity={0.05} />

      <div className="section relative grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={inViewOnce}>
          <h2 className="text-3xl text-ink sm:text-4xl">O‘z qahramoningizni yarating</h2>
          <p className="mt-3 max-w-lg text-lg text-ink-soft">
            Har bir o‘yinchi rangni, bosh kiyimni va yuz ifodasini o‘zi tanlab, noyob qahramon
            yasaydi — o‘yinga qo‘shilishdan oldin, bir necha soniyada.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="card mx-auto w-full max-w-xs"
        >
          <QahramonBuilder value={demo} onChange={setDemo} previewSize={130} />
        </motion.div>
      </div>
    </section>
  )
}
