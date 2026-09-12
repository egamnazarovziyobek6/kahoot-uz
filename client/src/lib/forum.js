// Forumda mehmon (o'quvchi) sifatida qatnashish uchun brauzerda saqlanadigan yengil identifikator.
// Bu hisob emas — faqat "kim layk bosdi" va "ismini eslab qolish" uchun.

const KEY_STORAGE = 'kahoot_uz_guest_key'
const NAME_STORAGE = 'kahoot_uz_guest_name'

export function getGuestKey() {
  try {
    let key = localStorage.getItem(KEY_STORAGE)
    if (!key) {
      key = crypto.randomUUID()
      localStorage.setItem(KEY_STORAGE, key)
    }
    return key
  } catch {
    return null
  }
}

export function getGuestName() {
  try {
    return localStorage.getItem(NAME_STORAGE) || ''
  } catch {
    return ''
  }
}

export function setGuestName(name) {
  try {
    localStorage.setItem(NAME_STORAGE, name)
  } catch {
    /* localStorage yo'q bo'lsa jim o'tkazamiz */
  }
}
