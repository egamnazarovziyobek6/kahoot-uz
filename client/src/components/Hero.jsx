import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { IconPlayerPlayFilled } from '@tabler/icons-react'
import JoinPin from './JoinPin.jsx'
import Mascot from './mascots/Mascot.jsx'
import FloatingDecor from './decor/FloatingDecor.jsx'
import UzFlag from './decor/UzFlag.jsx'
import CreatorBadge from './CreatorBadge.jsx'
import { BODY_COLORS } from '../lib/avatarParts.js'
import { fadeUp, stagger } from '../lib/motion.js'

const HERO_LEFT = { color: BODY_COLORS[1].value, hat: 'doppi', face: 'tabassum' }
const HERO_RIGHT = { color: BODY_COLORS[4].value, hat: 'cap', face: 'salqin' }

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-10 pb-16 sm:pt-16">
      <FloatingDecor />

      <div className="section relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-surface/70 px-4 py-1.5 text-sm font-bold text-ink-soft shadow-sm backdrop-blur"
          >
            <UzFlag size={18} /> Ingliz tili darslari uchun o‘yin platformasi
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-5 text-4xl !leading-[1.16] text-ink sm:text-5xl lg:text-[3.4rem]"
          >
            Ingliz tili darsini{' '}
            <span
              className="box-decoration-clone rounded-lg bg-saffron/40 px-2 py-0.5 text-anor"
              style={{ WebkitBoxDecorationBreak: 'clone' }}
            >
              o‘yinga
            </span>{' '}
            aylantiring
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-5 max-w-xl text-lg text-ink-soft">
            Kahoot UZ — grammatika, lug‘at va tinglab tushunish bo‘yicha jonli viktorinalar,
            Gemini AI yordamida savol yaratish va quvnoq qahramonlar bilan ingliz tili darsini
            bir zumda jonlantiring.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-6">
            <CreatorBadge />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-4">
            <Link to="/yaratish" className="btn-primary text-lg">
              Bepul boshlash
            </Link>
            <a href="#qanday" className="btn-ghost !gap-2 text-lg">
              <IconPlayerPlayFilled size={16} /> Qanday ishlaydi
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4 text-sm text-ink-soft">
            <div className="flex -space-x-2">
              {BODY_COLORS.map((c) => (
                <span
                  key={c.id}
                  className="grid h-9 w-9 place-items-center rounded-full border-2 border-cream"
                  style={{ background: c.value }}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
                </span>
              ))}
            </div>
            <p>
              <b className="text-ink">10 000+</b> o‘quvchi va o‘qituvchi allaqachon o‘ynamoqda
            </p>
          </motion.div>
        </motion.div>

        {/* o'ng ustun — PIN kartasi va qahramonlar */}
        <div className="relative mx-auto flex w-full max-w-md justify-center px-4 pt-10 sm:px-10">
          <motion.div
            className="pointer-events-none absolute -bottom-4 -left-8 z-0 hidden w-28 sm:block lg:-left-16"
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          >
            <Mascot character={HERO_LEFT} size={124} pose="wave" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute -bottom-6 -right-9 z-0 hidden w-32 sm:block lg:-right-16"
            animate={{ y: [0, -16, 0] }}
            transition={{ repeat: Infinity, duration: 6.2, ease: 'easeInOut', delay: 0.4 }}
          >
            <Mascot character={HERO_RIGHT} size={136} pose="idle" />
          </motion.div>

          <motion.div
            className="relative z-10 w-full"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <JoinPin />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
