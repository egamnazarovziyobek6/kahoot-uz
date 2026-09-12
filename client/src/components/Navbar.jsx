import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'

const links = [
  { href: '#imkoniyatlar', label: 'Imkoniyatlar' },
  { href: '#qahramonlar', label: 'Qahramonlar' },
  { href: '#qanday', label: 'Qanday ishlaydi' },
  { href: '#viktorinalar', label: 'Viktorinalar' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-cream/80 backdrop-blur-md">
      <nav className="section flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="" width={38} height={38} className="drop-shadow-sm" />
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">
            Kahoot <span className="text-samarkand">UZ</span>
          </span>
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-semibold text-ink-soft transition-colors hover:text-samarkand"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <a href="#join" className="btn-ghost !px-4 !py-2 text-sm">
            Kirish
          </a>
          <Link to="/yaratish" className="btn-primary !px-4 !py-2 text-sm">
            Test yaratish
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl border-2 border-white/10 bg-surface/70 lg:hidden"
          aria-label="Menyu"
          aria-expanded={open}
        >
          <span className="text-lg">{open ? '✕' : '☰'}</span>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5 bg-cream lg:hidden"
          >
            <ul className="section flex flex-col gap-1 py-3">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2.5 font-semibold text-ink-soft hover:bg-surface"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="mt-2 flex gap-3 px-1 md:hidden">
                <a href="#join" onClick={() => setOpen(false)} className="btn-ghost flex-1 !py-2 text-sm">
                  O‘yinga kirish
                </a>
                <Link
                  to="/yaratish"
                  onClick={() => setOpen(false)}
                  className="btn-primary flex-1 !py-2 text-sm"
                >
                  Test yaratish
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
