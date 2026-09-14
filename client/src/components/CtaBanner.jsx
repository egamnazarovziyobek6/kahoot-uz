import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import Mascot from './mascots/Mascot.jsx'
import NaqshPattern from './decor/NaqshPattern.jsx'
import { BODY_COLORS, HATS, FACES } from '../lib/avatarParts.js'
import { fadeUp, inViewOnce } from '../lib/motion.js'

const BANNER_CREW = [
  { id: 'a', color: BODY_COLORS[0].value, hat: HATS[0].id, face: FACES[0].id },
  { id: 'b', color: BODY_COLORS[2].value, hat: HATS[1].id, face: FACES[2].id },
  { id: 'c', color: BODY_COLORS[4].value, hat: HATS[0].id, face: FACES[3].id },
  { id: 'd', color: BODY_COLORS[6].value, hat: HATS[2].id, face: FACES[1].id },
]

export default function CtaBanner() {
  return (
    <section className="section pb-24 pt-6">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="relative overflow-hidden rounded-2xl px-6 py-14 text-center text-white sm:px-12"
        style={{
          background: 'linear-gradient(160deg, #1EA5B8 0%, #0E7C9D 55%, #124A5E 100%)',
        }}
      >
        <NaqshPattern color="#FBF3E4" opacity={0.12} />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl sm:text-4xl">Bugun birinchi darsingizni o‘yinga aylantiring</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/85">
            Karta talab qilinmaydi. Bir daqiqada ro‘yxatdan o‘ting va sinfingizni hayratda qoldiring.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/yaratish" className="btn-primary text-lg">
              Bepul boshlash
            </Link>
            <a
              href="#imkoniyatlar"
              className="btn border-2 border-white/40 bg-white/10 text-lg text-white backdrop-blur"
            >
              Imkoniyatlar
            </a>
          </div>
        </div>

        <div className="pointer-events-none relative mt-10 flex justify-center gap-2 sm:gap-8">
          {BANNER_CREW.map((c, i) => (
            <motion.div
              key={c.id}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 + i * 0.4, ease: 'easeInOut' }}
              className={i % 2 ? 'translate-y-3' : ''}
            >
              <Mascot character={c} size={92} pose={i === 1 ? 'cheer' : 'idle'} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
