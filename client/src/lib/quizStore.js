// Testlar ombori — hozircha brauzerning localStorage'ida.
// API'ga o'tishda faqat shu fayl o'zgaradi.

import { makeQuiz, makeQuestion, makeAnswer, cloneQuiz, uid } from './quiz.js'

const KEY = 'kahoot-uz:quizzes'
const SEEDED_KEY = 'kahoot-uz:seeded'

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    return true
  } catch (e) {
    console.warn('Testni saqlab bo‘lmadi (localStorage to‘lgan bo‘lishi mumkin):', e)
    return false
  }
}

export function listQuizzes() {
  ensureSeed()
  return read().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

export function getQuiz(id) {
  ensureSeed()
  return read().find((q) => q.id === id) ?? null
}

export function saveQuiz(quiz) {
  const list = read()
  const idx = list.findIndex((q) => q.id === quiz.id)
  const next = { ...quiz, updatedAt: Date.now() }
  if (idx >= 0) list[idx] = next
  else list.unshift(next)
  const ok = write(list)
  return { quiz: next, ok }
}

export function deleteQuiz(id) {
  write(read().filter((q) => q.id !== id))
}

export function duplicateQuiz(id) {
  const src = getQuiz(id)
  if (!src) return null
  const copy = cloneQuiz(src, { title: `${src.title || 'Test'} (nusxa)` })
  saveQuiz(copy)
  return copy
}

// ---------------------------------------------------------------------------
// Birinchi kirishda namuna test — o'qituvchi format bilan tanishishi uchun
// ---------------------------------------------------------------------------
function ensureSeed() {
  try {
    if (localStorage.getItem(SEEDED_KEY)) return
    if (read().length === 0) write([sampleHistoryQuiz()])
    localStorage.setItem(SEEDED_KEY, '1')
  } catch {
    /* localStorage yo'q — namuna keyingi safar qo'shiladi */
  }
}

function q(text, type, answers, extra = {}) {
  const base = makeQuestion(type)
  return {
    ...base,
    text,
    ...extra,
    answers: answers.map((a) =>
      typeof a === 'string' ? makeAnswer(a) : makeAnswer(a.text, a.correct),
    ),
  }
}

function sampleHistoryQuiz() {
  return makeQuiz({
    id: uid('quiz'),
    title: "O'zbekiston tarixi — kirish",
    description: "5–9-sinflar uchun 5 ta savoldan iborat namuna test. Uni tahrirlang yoki o'zingiznikini yarating.",
    subject: 'Tarix',
    grade: '7–9-sinf',
    themeColor: '#0E7C9D',
    visibility: 'private',
    questions: [
      q(
        "Amir Temur saltanatining poytaxti qaysi shahar bo'lgan?",
        'quiz',
        [
          { text: 'Samarqand', correct: true },
          { text: 'Buxoro', correct: false },
          { text: 'Toshkent', correct: false },
          { text: 'Xiva', correct: false },
        ],
        { timeLimit: 20 },
      ),
      q(
        'Zahiriddin Muhammad Bobur qaysi mashhur asarni yozgan?',
        'quiz',
        [
          { text: '«Boburnoma»', correct: true },
          { text: '«Shohnoma»', correct: false },
          { text: '«Xamsa»', correct: false },
          { text: '«Qutadg‘u bilig»', correct: false },
        ],
        { timeLimit: 20 },
      ),
      q(
        "O'zbekiston qaysi yili mustaqillikka erishgan?",
        'quiz',
        [
          { text: '1991', correct: true },
          { text: '1989', correct: false },
          { text: '1990', correct: false },
          { text: '1993', correct: false },
        ],
        { timeLimit: 15, points: 'double' },
      ),
      q(
        'Buyuk ipak yo‘li Xitoyni O‘rta yer dengizi mintaqasi bilan bog‘lagan.',
        'truefalse',
        [
          { text: 'To‘g‘ri', correct: true },
          { text: 'Noto‘g‘ri', correct: false },
        ],
        { timeLimit: 10 },
      ),
      q(
        "Quyidagilardan qaysilari O'zbekistondagi YuNESKO merosi ro'yxatiga kiritilgan shaharlar?",
        'multi',
        [
          { text: 'Buxoro', correct: true },
          { text: 'Samarqand', correct: true },
          { text: 'Namangan', correct: false },
          { text: 'Xiva (Itchan Qal’a)', correct: true },
        ],
        { timeLimit: 30 },
      ),
    ],
  })
}
