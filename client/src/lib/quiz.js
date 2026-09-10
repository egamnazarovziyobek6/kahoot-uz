// Test (viktorina) ma'lumot modeli, konstantalar va yordamchi funksiyalar.
// Hozircha localStorage'da saqlanadi — kelajakda server API'siga almashtiriladi.

export const QUESTION_TYPES = {
  quiz: { label: 'Viktorina', hint: 'Bitta to‘g‘ri javob', icon: '◆' },
  multi: { label: 'Ko‘p javobli', hint: 'Bir nechta to‘g‘ri javob', icon: '☑' },
  truefalse: { label: 'To‘g‘ri / Noto‘g‘ri', hint: 'Ikki variant', icon: '⚖' },
  input: { label: 'Yozma javob', hint: 'O‘quvchi javobni yozadi', icon: '⌨' },
}

export const TIME_OPTIONS = [5, 10, 20, 30, 45, 60, 90, 120]

export const POINTS_OPTIONS = [
  { id: 'standard', label: 'Oddiy', factor: 1 },
  { id: 'double', label: 'Ikki baravar', factor: 2 },
  { id: 'none', label: 'Ballsiz', factor: 0 },
]

// Javob variantlari: rang + shakl (Kahoot uslubi)
export const ANSWER_STYLES = [
  { color: '#E24A3B', shape: 'triangle' },
  { color: '#1368CE', shape: 'diamond' },
  { color: '#F5A623', shape: 'circle' },
  { color: '#1B7A4B', shape: 'square' },
]

export const THEME_COLORS = ['#0E7C9D', '#E24A3B', '#F5A623', '#1B7A4B', '#2B3A8C', '#7A3E9D']

export const SUBJECTS = [
  'Tarix',
  'Geografiya',
  'Ona tili va adabiyot',
  'Matematika',
  'Fizika',
  'Kimyo',
  'Biologiya',
  'Ingliz tili',
  'Informatika',
  'Boshqa',
]

export const GRADES = [
  '1–4-sinf',
  '5–6-sinf',
  '7–9-sinf',
  '10–11-sinf',
  'Talabalar',
  'Aralash',
]

export const MAX_ANSWERS = 4
export const MIN_ANSWERS = 2
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024 // 2 MB — localStorage cheklovi uchun

let counter = 0
export function uid(prefix = 'id') {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`
}

export function makeAnswer(text = '', correct = false) {
  return { id: uid('a'), text, correct }
}

export function makeQuestion(type = 'quiz') {
  const base = {
    id: uid('q'),
    type,
    text: '',
    image: null,
    timeLimit: 20,
    points: 'standard',
  }
  if (type === 'truefalse') {
    return { ...base, answers: [makeAnswer('To‘g‘ri', true), makeAnswer('Noto‘g‘ri', false)] }
  }
  if (type === 'input') {
    return { ...base, answers: [makeAnswer('', true)] }
  }
  return { ...base, answers: [makeAnswer(), makeAnswer(), makeAnswer(), makeAnswer()] }
}

export function makeQuiz(partial = {}) {
  const now = Date.now()
  return {
    id: uid('quiz'),
    title: '',
    description: '',
    subject: '',
    grade: '',
    cover: null,
    themeColor: THEME_COLORS[0],
    visibility: 'private',
    createdAt: now,
    updatedAt: now,
    questions: [makeQuestion('quiz')],
    ...partial,
  }
}

/** Nusxa olishda barcha id'larni yangilaymiz */
export function cloneQuiz(src, overrides = {}) {
  return {
    ...src,
    id: uid('quiz'),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    questions: src.questions.map((q) => ({
      ...q,
      id: uid('q'),
      answers: q.answers.map((a) => ({ ...a, id: uid('a') })),
    })),
    ...overrides,
  }
}

export function cloneQuestion(q) {
  return {
    ...q,
    id: uid('q'),
    answers: q.answers.map((a) => ({ ...a, id: uid('a') })),
  }
}

export function validateQuestion(q) {
  const errors = []
  if (!q.text.trim()) errors.push('Savol matni yozilmagan')

  if (q.type === 'input') {
    if (!q.answers.some((a) => a.text.trim())) errors.push('Kamida bitta to‘g‘ri javob yozing')
    return errors
  }

  const filled = q.answers.filter((a) => a.text.trim())
  if (filled.length < MIN_ANSWERS) errors.push(`Kamida ${MIN_ANSWERS} ta javob varianti kerak`)
  if (!filled.some((a) => a.correct)) errors.push('To‘g‘ri javob belgilanmagan')
  return errors
}

export function validateQuiz(quiz) {
  const meta = {}
  if (!quiz.title.trim()) meta.title = 'Test nomini kiriting'
  if (quiz.questions.length === 0) meta.questions = 'Kamida bitta savol qo‘shing'

  const questions = quiz.questions.map(validateQuestion)
  const ok =
    Object.keys(meta).length === 0 && questions.every((errs) => errs.length === 0)
  return { ok, meta, questions }
}

/** O'yin uchun taxminiy davomiylik */
export function estimateDuration(quiz) {
  const seconds = quiz.questions.reduce((s, q) => s + q.timeLimit + 6, 0)
  const min = Math.max(1, Math.round(seconds / 60))
  return `~${min} daqiqa`
}

export function isQuestionType(t) {
  return Object.prototype.hasOwnProperty.call(QUESTION_TYPES, t)
}
