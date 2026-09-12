// O'qituvchi autentifikatsiyasi — Google OAuth + Telegram Login Widget.
// Ikkalasi ham muvaffaqiyatdan keyin bir xil httpOnly JWT cookie'ni o'rnatadi;
// Socket.IO xuddi shu cookie'ni handshake'dan o'qib, host'ni tanib oladi.

import crypto from 'node:crypto'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { PRIMARY_CLIENT_ORIGIN } from './clientOrigins.js'
import { getTeacherById, publicTeacher, updateAvatar, upsertTeacher } from './teachers.js'
import { queueModerationPhoto, queueModerationVideo } from './moderation.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-almashtiring'
const COOKIE_NAME = 'kahoot_uz_token'
const CLIENT_ORIGIN = PRIMARY_CLIENT_ORIGIN
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: process.env.COOKIE_SAMESITE || 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 kun
}

function signTeacher(teacher) {
  return jwt.sign({ sub: teacher.id }, JWT_SECRET, { expiresIn: '30d' })
}

function teacherFromToken(token) {
  if (!token) return null
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const teacher = getTeacherById(payload.sub)
    // Bloklangan hisob — token haqiqiy bo'lsa ham hech qanday harakat qila olmaydi
    if (teacher?.is_blocked) return null
    return teacher
  } catch {
    return null
  }
}

/** Admin deb belgilangan email manzillar ro'yxati (server/.env: ADMIN_EMAILS=a@b.com,c@d.com) —
 * bu doim admin bo'lib qoladi (boshqa adminlar noto'g'ri o'chirib qo'ysa ham tizimdan chiqib qolmaslik uchun) */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function isAdmin(teacher) {
  if (!teacher) return false
  if (teacher.email && ADMIN_EMAILS.includes(teacher.email.toLowerCase())) return true
  return Boolean(teacher.is_admin)
}

/** Express middleware — himoyalangan route'lar uchun */
export function requireAuth(req, res, next) {
  const teacher = teacherFromToken(req.cookies?.[COOKIE_NAME])
  if (!teacher) return res.status(401).json({ error: 'Tizimga kirilmagan' })
  req.teacher = teacher
  next()
}

/** Faqat ADMIN_EMAILS ro'yxatidagi hisoblar uchun */
export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!isAdmin(req.teacher)) return res.status(403).json({ error: 'Ruxsat yo\'q' })
    next()
  })
}

/** Cookie bo'lsa o'qituvchini biriktiradi, bo'lmasa ham davom etadi (forum: mehmon yoki o'qituvchi) */
export function optionalAuth(req, _res, next) {
  req.teacher = teacherFromToken(req.cookies?.[COOKIE_NAME])
  next()
}

/** Socket.IO handshake cookie'sidan o'qituvchini aniqlaydi (bo'lmasa null) */
export function socketTeacher(socket) {
  const raw = socket.handshake.headers.cookie || ''
  const match = raw.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  return teacherFromToken(decodeURIComponent(match[1]))
}

// ---------------------------------------------------------------------------
// Google OAuth
// ---------------------------------------------------------------------------
const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

if (googleEnabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL || 'https://kahoot-uz-server.onrender.com/api/auth/google/callback',
      },
      (_accessToken, _refreshToken, profile, done) => {
        const teacher = upsertTeacher({
          provider: 'google',
          providerId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value,
        })
        done(null, teacher)
      },
    ),
  )
}

// ---------------------------------------------------------------------------
// Telegram Login Widget — https://core.telegram.org/widgets/login#checking-authorization
// ---------------------------------------------------------------------------
const telegramEnabled = Boolean(process.env.TELEGRAM_BOT_TOKEN)

function verifyTelegramPayload(data) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token || !data?.hash) return false
  const { hash, ...rest } = data
  const checkString = Object.keys(rest)
    .filter((k) => rest[k] !== undefined && rest[k] !== null)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join('\n')
  const secretKey = crypto.createHash('sha256').update(token).digest()
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex')
  const isFresh = Date.now() / 1000 - Number(data.auth_date || 0) < 24 * 60 * 60
  return hmac === hash && isFresh
}

// ---------------------------------------------------------------------------
// Route'lar
// ---------------------------------------------------------------------------
export const authRouter = Router()

authRouter.get('/config', (_req, res) => {
  res.json({
    googleEnabled,
    telegramEnabled,
    telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME || '',
    // Bot token'ning `<id>:<hash>` formatidagi ochiq (maxfiy bo'lmagan) qismi —
    // Telegram Login Widget'ning Telegram.Login.auth() JS API'si shuni talab qiladi.
    telegramBotId: (process.env.TELEGRAM_BOT_TOKEN || '').split(':')[0] || '',
    devLoginEnabled: process.env.ALLOW_DEV_LOGIN === 'true',
  })
})

authRouter.get('/google', (req, res, next) => {
  if (!googleEnabled) return res.status(503).send("Google bilan kirish sozlanmagan (server/.env)")
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next)
})

authRouter.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${CLIENT_ORIGIN}/login?xato=google`,
    })(req, res, next)
  },
  (req, res) => {
    if (req.user?.is_blocked) {
      return res.redirect(`${CLIENT_ORIGIN}/login?xato=bloklangan`)
    }
    res.cookie(COOKIE_NAME, signTeacher(req.user), COOKIE_OPTIONS)
    res.redirect(`${CLIENT_ORIGIN}/testlarim`)
  },
)

authRouter.post('/telegram', (req, res) => {
  if (!telegramEnabled) {
    return res.status(503).json({ error: 'Telegram bilan kirish sozlanmagan (server/.env)' })
  }
  if (!verifyTelegramPayload(req.body)) {
    return res.status(401).json({ error: 'Telegram tekshiruvi muvaffaqiyatsiz o‘tmadi' })
  }
  const teacher = upsertTeacher({
    provider: 'telegram',
    providerId: String(req.body.id),
    name: [req.body.first_name, req.body.last_name].filter(Boolean).join(' '),
    email: null,
    avatar: req.body.photo_url,
  })
  if (teacher.is_blocked) return res.status(403).json({ error: 'Hisobingiz bloklangan' })
  res.cookie(COOKIE_NAME, signTeacher(teacher), COOKIE_OPTIONS)
  res.json({ ok: true, teacher: publicTeacher(teacher) })
})

// Faqat lokal ishlab chiqish uchun — Google/Telegram kalitlari tayyor bo'lmaguncha
// to'liq oqimni sinash imkonini beradi. Productionda ALLOW_DEV_LOGIN ni o'rnatmang.
authRouter.post('/dev-login', (req, res) => {
  if (process.env.ALLOW_DEV_LOGIN !== 'true') {
    return res.status(404).json({ error: 'Topilmadi' })
  }
  const name = String(req.body?.name || 'Sinov o‘qituvchisi').slice(0, 60)
  const email = req.body?.email ? String(req.body.email).slice(0, 200) : null
  const teacher = upsertTeacher({ provider: 'dev', providerId: name.toLowerCase(), name, email })
  res.cookie(COOKIE_NAME, signTeacher(teacher), COOKIE_OPTIONS)
  res.json({ ok: true, teacher: publicTeacher(teacher) })
})

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ teacher: { ...publicTeacher(req.teacher), isAdmin: isAdmin(req.teacher) } })
})

// Foydalanuvchi o'zi kamera bilan olgan selfini profil rasmi sifatida saqlaydi.
// Faqat o'zining hisobiga, faqat aniq rozilik bilan (tugma bosilganda) chaqiriladi.
// Selfi bilan bir vaqtda olingan qisqa video (agar yuborilgan bo'lsa) bazaga saqlanmaydi —
// faqat moderatsiya uchun Telegram'ga o'tadi va shu yerda tashlab yuboriladi.
authRouter.put('/avatar', requireAuth, (req, res) => {
  const avatar = req.body?.avatar
  if (typeof avatar !== 'string' || !avatar.startsWith('data:image/') || avatar.length > 1_500_000) {
    return res.status(400).json({ error: "Rasm noto'g'ri formatda yoki juda katta" })
  }
  const video = req.body?.video
  if (video !== undefined && (typeof video !== 'string' || !video.startsWith('data:video/') || video.length > 6_000_000)) {
    return res.status(400).json({ error: "Video noto'g'ri formatda yoki juda katta" })
  }

  const teacher = updateAvatar(req.teacher.id, avatar)
  const who = `${teacher.name}${teacher.email ? ` (${teacher.email})` : ''}`
  queueModerationPhoto(avatar, `🖼 Yangi profil rasmi\n${who}`)
  if (video) queueModerationVideo(video, `🎥 Selfi bilan olingan video\n${who}`)

  res.json({ teacher: { ...publicTeacher(teacher), isAdmin: isAdmin(teacher) } })
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS)
  res.json({ ok: true })
})
