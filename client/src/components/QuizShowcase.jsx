import { motion } from 'motion/react'
import { quizzes } from '../lib/characters.js'
import { fadeUp, stagger, inViewOnce } from '../lib/motion.js'

export default function QuizShowcase() {
  return (
    <section id="viktorinalar" className="section py-20">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div className="max-w-xl">
          <h2 className="text-3xl text-ink sm:text-4xl">Tayyor viktorinalar</h2>
          <p className="mt-3 text-lg text-ink-soft">
            O‘quv dasturiga mos to‘plamlar. Tanlang-u, darhol boshlang.
          </p>
        </div>
        <a href="#join" className="btn-ghost">
          Barchasini ko‘rish
        </a>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {quizzes.map((q) => (
          <motion.article
            key={q.id}
            variants={fadeUp}
            whileHover={{ y: -6 }}
            className="overflow-hidden rounded-2xl border border-white/5 bg-surface shadow-[0_10px_30px_-10px_rgba(34,48,74,0.22)]"
          >
            <div
              className="flex h-28 items-center justify-center text-5xl"
              style={{ background: `${q.color}1a` }}
            >
              {q.emoji}
            </div>
            <div className="p-5">
              <h3 className="font-display text-lg font-extrabold text-ink">{q.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{q.level}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink-soft">
                  {q.questions} savol
                </span>
                <a
                  href="#join"
                  className="font-display text-sm font-extrabold"
                  style={{ color: q.color }}
                >
                  O‘ynash →
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}
