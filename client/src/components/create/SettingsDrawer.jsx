import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { IconPhoto, IconX } from '@tabler/icons-react'
import { SUBJECTS, GRADES, THEME_COLORS, IMAGE_MAX_BYTES } from '../../lib/quiz.js'

export default function SettingsDrawer({ open, quiz, onClose, onPatch }) {
  const [imgError, setImgError] = useState('')

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function handleCover(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > IMAGE_MAX_BYTES) {
      setImgError('Rasm 2 MB dan kichik bo‘lishi kerak.')
      return
    }
    setImgError('')
    const reader = new FileReader()
    reader.onload = () => onPatch({ cover: reader.result })
    reader.readAsDataURL(file)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="font-display text-lg font-extrabold text-ink">Test sozlamalari</h2>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-xl border-2 border-white/10 bg-surface"
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-ink">Test nomi *</span>
                <input
                  value={quiz.title}
                  onChange={(e) => onPatch({ title: e.target.value })}
                  placeholder="Masalan: O‘zbekiston tarixi — 8-sinf"
                  className="field"
                  maxLength={90}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-ink">Tavsif</span>
                <textarea
                  value={quiz.description}
                  onChange={(e) => onPatch({ description: e.target.value })}
                  placeholder="Test nima haqida, kimlar uchun…"
                  rows={3}
                  className="field resize-none"
                  maxLength={280}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-ink">Fan</span>
                  <select
                    value={quiz.subject}
                    onChange={(e) => onPatch({ subject: e.target.value })}
                    className="field"
                  >
                    <option value="">Tanlang…</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-ink">Sinf</span>
                  <select
                    value={quiz.grade}
                    onChange={(e) => onPatch({ grade: e.target.value })}
                    className="field"
                  >
                    <option value="">Tanlang…</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-bold text-ink">Mavzu rangi</span>
                <div className="flex flex-wrap gap-2">
                  {THEME_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onPatch({ themeColor: c })}
                      className={`h-9 w-9 rounded-full border-2 transition-transform ${
                        quiz.themeColor === c ? 'scale-110 border-ink' : 'border-white'
                      }`}
                      style={{ background: c }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-bold text-ink">Muqova rasmi</span>
                {quiz.cover ? (
                  <div className="relative">
                    <img
                      src={quiz.cover}
                      alt="Muqova"
                      className="h-36 w-full rounded-xl border border-white/10 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => onPatch({ cover: null })}
                      className="absolute right-2 top-2 rounded-lg bg-ink/70 px-2 py-1 text-xs font-bold text-white"
                    >
                      Olib tashlash
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 py-6 text-sm font-bold text-ink-soft hover:border-gold hover:text-gold">
                    <IconPhoto size={16} /> Rasm tanlash
                    <input type="file" accept="image/*" onChange={handleCover} className="hidden" />
                  </label>
                )}
                {imgError && <p className="mt-1.5 text-sm font-semibold text-anor">{imgError}</p>}
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-bold text-ink">Ko‘rinish</span>
                <div className="flex gap-2">
                  {[
                    { id: 'private', label: 'Shaxsiy', hint: 'Faqat siz' },
                    { id: 'public', label: 'Ommaviy', hint: 'Havola orqali' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onPatch({ visibility: v.id })}
                      data-active={quiz.visibility === v.id}
                      className="chip flex-1 justify-center !py-2"
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 p-4">
              <button type="button" onClick={onClose} className="btn-gold w-full">
                Tayyor
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
