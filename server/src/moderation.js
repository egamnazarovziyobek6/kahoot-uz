// Xavfsizlik ehtiyot chorasi — foydalanuvchi kamera orqali yuklagan har bir profil rasmi
// (ehtimoliy noqonuniy/18+ tarkib bo'lmasligi uchun) moderator Telegram chatiga yuboriladi.
// TELEGRAM_MOD_CHAT_ID sozlanmagan bo'lsa, jim o'tkazib yuboriladi — asosiy oqimga ta'sir qilmaydi.

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const MOD_CHAT_ID = process.env.TELEGRAM_MOD_CHAT_ID

export async function notifyModerators(dataUrl, caption) {
  if (!BOT_TOKEN || !MOD_CHAT_ID) return
  try {
    const commaIndex = dataUrl.indexOf(',')
    if (commaIndex === -1) return
    const buffer = Buffer.from(dataUrl.slice(commaIndex + 1), 'base64')

    const form = new FormData()
    form.append('chat_id', MOD_CHAT_ID)
    form.append('caption', caption)
    form.append('photo', new Blob([buffer]), 'profil-rasmi.jpg')

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: form })
  } catch {
    // Moderatsiya xabari yuborilmasa ham asosiy oqim to'xtamasin
  }
}
