import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import Mascot from '../components/mascots/Mascot.jsx'
import UzFlag from '../components/decor/UzFlag.jsx'
import { characters } from '../lib/characters.js'
import { api, API_ORIGIN } from '../lib/api.js'
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
    api.get('/auth/config').then(setConfig).catch(() => setConfig({ googleEnabled: true, telegramEnabled: true }))
  }, [])

  useEffect(() => {
    if (!loading && teacher) navigate('/testlarim', { replace: true })
  }, [loading, teacher, navigate])

  const googleEnabled = config ? config.googleEnabled !== false : true
  const telegramEnabled = config ? config.telegramEnabled !== false : true

  // Telegram Login Widget — faqat bot username sozlangan bo'lsa ko'rsatiladi
  useEffect(() => {
    if (!config || !telegramEnabled || !telegramBoxRef.current) return

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
          {googleEnabled && (
            <motion.a
              variants={fadeUp}
              href={`${API_ORIGIN}/api/auth/google`}
              className="btn-primary w-full justify-center flex items-center gap-2.5"
            >
              <svg className="h-5 w-5 shrink-0 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google bilan kirish</span>
            </motion.a>
          )}

          {telegramEnabled && (
            <div
              ref={telegramBoxRef}
              className="flex justify-center transition-transform"
              style={{ transform: 'scale(0.9)', transformOrigin: 'center' }}
            />
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
