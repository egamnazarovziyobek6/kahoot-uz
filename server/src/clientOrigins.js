// CLIENT_ORIGIN bir nechta domenni (vergul bilan ajratilgan) qabul qiladi — masalan
// sayt bir nechta domenda (asosiy domen + subdomen + *.pages.dev) ko'rinsa shular kerak bo'ladi.

export const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

// OAuth redirect kabi bitta manzil kerak bo'lgan joylar uchun — ro'yxatdagi birinchisi asosiy hisoblanadi
export const PRIMARY_CLIENT_ORIGIN = CLIENT_ORIGINS[0]
