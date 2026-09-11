import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import Mascot from '../components/mascots/Mascot.jsx'
import UzFlag from '../components/decor/UzFlag.jsx'
import { characters } from '../lib/characters.js'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { fadeUp, popIn } from '../lib/motion.js'

export default function Login() {
  const navigate = useNavigate()
  const { teacher, loading, refresh } = useAuth()
  const [config, setConfig] = useState(null)
  const [devName, setDevName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const telegramBoxRef = useRef(null)

  useEffect(() => {
    api.get('/auth/config').then(setConfig).catch(() => setConfig({}))
  }, [])

  useEffect(() => {
    if (!loading && teacher) navigate('/testlarim', { replace: true })
  }, [loading, teacher, navigate])

  // Telegram Login Widget — faqat bot username sozlangan bo'lsa ko'rsatiladi
  useEffect(() => {
    if (!config?.telegramEnabled || !telegramBoxRef.current) return

    window.onTelegramAuth = async (user) => {
      setBusy(true)
      setError(null)
      try {
        await api.post('/auth/telegram', user)
        await refresh()
        navigate('/testlarim')
      } catch (e) {
        setError(e.message)
      } finally {
        setBusy(false)
      }
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', config.telegramBotUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '14')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    telegramBoxRef.current.innerHTML = ''
    telegramBoxRef.current.appendChild(script)
  }, [config, navigate, refresh])

  async function devLogin() {
    setBusy(true)
    setError(null)
    try {
      await api.post('/auth/dev-login', { name: devName || undefined })
      await refresh()
      navigate('/testlarim')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <motion.div
        variants={popIn}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm rounded-3xl border border-black/5 bg-white p-7 shadow-[0_18px_40px_-12px_rgba(34,48,74,0.35)]"
      >
        <Link to="/" className="mb-5 flex items-center gap-2.5">
          <img src="/logo.svg" alt="" width={34} height={34} />
          <span className="font-display text-lg font-extrabold text-ink">
            Kahoot <span className="text-samarkand">UZ</span>
          </span>
        </Link>

        <div className="mb-5 flex items-center justify-center">
          <Mascot character={characters[1]} size={90} pose="wave" />
        </div>

        <h1 className="text-center font-display text-2xl font-extrabold text-ink">
          O‘qituvchi sifatida kirish
        </h1>
        <p className="mt-1.5 text-center text-sm text-ink-soft">
          <UzFlag size={14} className="mr-1 inline" /> Test tuzish va o‘yin boshlash uchun tizimga
          kiring
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {config?.googleEnabled ? (
            <motion.a
              variants={fadeUp}
              href="/api/auth/google"
              className="btn-primary w-full justify-center"
            >
              <span className="text-lg">G</span> Google bilan kirish
            </motion.a>
          ) : (
            <p className="rounded-xl bg-cream px-3 py-2.5 text-center text-xs font-semibold text-ink-soft">
              Google bilan kirish hali sozlanmagan
            </p>
          )}

          {config?.telegramEnabled ? (
            <div ref={telegramBoxRef} className="flex justify-center" />
          ) : (
            <p className="rounded-xl bg-cream px-3 py-2.5 text-center text-xs font-semibold text-ink-soft">
              Telegram bilan kirish hali sozlanmagan
            </p>
          )}

          {config?.devLoginEnabled && (
            <div className="mt-2 rounded-2xl border-2 border-dashed border-black/10 p-3">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
                Faqat sinov uchun (lokal)
              </p>
              <div className="flex gap-2">
                <input
                  value={devName}
                  onChange={(e) => setDevName(e.target.value)}
                  placeholder="Ismingiz"
                  className="field"
                />
                <button
                  type="button"
                  onClick={devLogin}
                  disabled={busy}
                  className="btn-ghost shrink-0 !px-4"
                >
                  Kirish
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-anor/10 px-3 py-2 text-sm font-semibold text-anor-deep">
            {error}
          </p>
        )}
      </motion.div>
    </div>
  )
}
