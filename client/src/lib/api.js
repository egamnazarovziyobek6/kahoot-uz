// Serverga so'rov yuborish uchun kichik yordamchi — cookie asosidagi sessiya bilan.
// Lokalda bo'sh qoldiriladi (Vite proxy /api ni :4000 ga yo'naltiradi). Productionda
// frontend (Cloudflare Pages) va backend (masalan Render) boshqa-boshqa domenda turgani
// uchun to'liq backend manzili VITE_API_URL orqali beriladi (build vaqtida sozlanadi).
const defaultBackend = import.meta.env.PROD ? 'https://kahoot-uz-server.onrender.com' : ''
export const API_ORIGIN = (import.meta.env.VITE_API_URL || defaultBackend).replace(/\/$/, '')
const BASE = `${API_ORIGIN}/api`

// Render kabi bepul hostinglarda "uyg'onish" 40-50s gacha cho'zilishi mumkin —
// shuncha vaqt kutamiz, lekin server haqiqatan ham o'chgan bo'lsa abadiy
// osilib qolmaslik uchun chegara qo'yamiz.
const REQUEST_TIMEOUT_MS = 45000

async function request(path, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let res
  try {
    res = await fetch(BASE + path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      signal: controller.signal,
      ...options,
    })
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error("Serverga ulanib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.")
    }
    throw e
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    let message = `So'rov xato qaytardi (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      /* javob JSON emas */
    }
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  del: (path) => request(path, { method: 'DELETE' }),
}
