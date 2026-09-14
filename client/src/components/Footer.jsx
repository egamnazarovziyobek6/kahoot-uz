const cols = [
  {
    title: 'Mahsulot',
    links: ['Imkoniyatlar', 'Viktorinalar', 'Qahramonlar', 'Narxlar'],
  },
  {
    title: 'Resurslar',
    links: ['O‘qituvchilar uchun', 'Qo‘llanma', 'Namuna to‘plamlar', 'Yangiliklar'],
  },
  {
    title: 'Kompaniya',
    links: ['Biz haqimizda', 'Aloqa', 'Maxfiylik', 'Foydalanish shartlari'],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface/60">
      <div className="section grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg?v=2" alt="" width={34} height={34} />
            <span className="font-display text-lg font-extrabold text-ink">
              Kahoot <span className="text-gold">UZ</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-ink-soft">
            O‘yin orqali o‘rganish platformasi. Sinfni jonlantiring, bilimni mustahkamlang.
          </p>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-display text-sm font-extrabold uppercase tracking-wide text-ink">
              {c.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#top" className="text-sm text-ink-soft transition-colors hover:text-gold">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5">
        <div className="section flex flex-col items-center justify-between gap-2 py-6 text-sm text-ink-soft sm:flex-row">
          <p>© {new Date().getFullYear()} Kahoot UZ. Barcha huquqlar himoyalangan.</p>
          <p className="font-display text-base font-extrabold text-ink">
            <span className="text-anor">ZIYOBEK TEAM</span> tomonidan yaratildi
          </p>
        </div>
      </div>
    </footer>
  )
}
