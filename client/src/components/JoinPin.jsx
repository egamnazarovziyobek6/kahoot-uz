import { useState } from 'react'
import { motion, useAnimationControls } from 'motion/react'

export default function JoinPin() {
  const [pin, setPin] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const shake = useAnimationControls()

  function onChange(e) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 6)
    setPin(v)
    if (msg) setMsg(null)
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (pin.length < 6) {
      shake.start({ x: [0, -10, 10, -8, 8, 0], transition: { duration: 0.4 } })
      setMsg({ type: 'error', text: 'PIN kodi 6 xonali bo‘lishi kerak.' })
      return
    }
    setBusy(true)
    setMsg(null)
    await new Promise((r) => setTimeout(r, 900))
    setBusy(false)
    setMsg({
      type: 'info',
      text: 'Tez orada! Jonli o‘yin serveri ulanmoqda — hozircha demo rejimda.',
    })
  }

  return (
    <motion.form
      id="join"
      onSubmit={onSubmit}
      animate={shake}
      className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-6 shadow-[0_18px_40px_-12px_rgba(34,48,74,0.35)]"
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-samarkand/12 text-lg">🎮</span>
        <h3 className="font-display text-lg font-extrabold text-ink">O‘yinga qo‘shilish</h3>
      </div>
      <p className="mb-4 text-sm text-ink-soft">PIN kodi o‘qituvchi ekranida ko‘rinadi.</p>

      <label htmlFor="pin" className="sr-only">
        O‘yin PIN kodi
      </label>
      <input
        id="pin"
        inputMode="numeric"
        autoComplete="off"
        placeholder="123 456"
        value={pin}
        onChange={onChange}
        className="w-full rounded-xl border-2 border-black/10 bg-cream/60 px-4 py-3 text-center font-display text-2xl font-extrabold tracking-[0.3em] text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-samarkand"
      />

      {msg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${
            msg.type === 'error'
              ? 'bg-anor/10 text-anor-deep'
              : 'bg-samarkand/10 text-samarkand-deep'
          }`}
        >
          {msg.text}
        </motion.p>
      )}

      <motion.button
        type="submit"
        disabled={busy}
        whileTap={{ scale: 0.97 }}
        className="btn-samarkand mt-4 w-full disabled:opacity-70"
      >
        {busy ? 'Ulanmoqda…' : 'Kirish'}
      </motion.button>
    </motion.form>
  )
}
