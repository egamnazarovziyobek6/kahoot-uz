import { motion } from 'motion/react'
import { fadeUp, stagger, inViewOnce } from '../lib/motion.js'

const features = [
  {
    icon: '⚡',
    title: 'Jonli viktorinalar',
    text: 'O‘quvchilar PIN kod bilan qo‘shiladi, savollar real vaqtda ekranda paydo bo‘ladi.',
    tint: 'bg-anor/10',
  },
  {
    icon: '📚',
    title: 'O‘zbekcha kontent',
    text: 'Tarix, adabiyot, geografiya va fan bo‘yicha tayyor to‘plamlar — darhol o‘ynang.',
    tint: 'bg-samarkand/10',
  },
  {
    icon: '🎭',
    title: 'Qahramonlar bilan',
    text: 'Anora, Bobur, Gulnoza va Sardor o‘yinni kuldiradi va bolalarni jalb qiladi.',
    tint: 'bg-saffron/15',
  },
  {
    icon: '👩‍🏫',
    title: 'Sinf va do‘stlar',
    text: 'Bitta xonada 60 tagacha o‘yinchi. Uyga vazifa yoki jamoaviy bahs rejimi.',
    tint: 'bg-chaman/10',
  },
]

export default function Features() {
  return (
    <section id="imkoniyatlar" className="section py-20">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-3xl text-ink sm:text-4xl">Nega Kahoot UZ?</h2>
        <p className="mt-3 text-lg text-ink-soft">
          O‘qituvchi uchun oddiy, o‘quvchi uchun qiziqarli. Hammasi bitta joyda.
        </p>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            whileHover={{ y: -6 }}
            className="card"
          >
            <div className={`grid h-12 w-12 place-items-center rounded-xl text-2xl ${f.tint}`}>
              {f.icon}
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-ink">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.text}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
