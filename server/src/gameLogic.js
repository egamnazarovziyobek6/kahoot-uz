// O'yin sikli yordamchilari: javobni tekshirish, ball hisoblash, o'quvchiga
// yuboriladigan "to'g'ri javobsiz" savol shakli. Natijalar faqat o'yin oxirida ochiladi —
// shuning uchun bu yerdagi hech qaysi funksiya o'yin davomida to'g'ri javobni chiqarmaydi.

// client/src/lib/quiz.js dagi POINTS_OPTIONS bilan mos
const POINTS_FACTOR = { standard: 1, double: 2, none: 0 }

export function checkAnswer(question, submitted) {
  if (question.type === 'input') {
    const given = String(submitted ?? '').trim().toLowerCase()
    if (!given) return false
    return question.answers.some((a) => a.text.trim().toLowerCase() === given)
  }

  const correctIds = new Set(question.answers.filter((a) => a.correct).map((a) => a.id))

  if (question.type === 'multi') {
    const submittedIds = new Set(Array.isArray(submitted) ? submitted : [])
    if (submittedIds.size === 0 || submittedIds.size !== correctIds.size) return false
    for (const id of submittedIds) if (!correctIds.has(id)) return false
    return true
  }

  // quiz | truefalse — bitta javob id'si
  return correctIds.has(submitted)
}

export function computePoints({ correct, timeLimit, elapsedMs, points }) {
  const factor = POINTS_FACTOR[points] ?? 1
  if (!correct || factor === 0) return 0
  const ratio = Math.max(0, Math.min(1, 1 - elapsedMs / (timeLimit * 1000)))
  return Math.round(1000 * factor * (0.5 + 0.5 * ratio))
}

/** O'quvchi/host ekraniga yuboriladigan versiya — to'g'ri javob belgisi olib tashlanadi */
export function publicQuestion(question) {
  return {
    id: question.id,
    type: question.type,
    text: question.text,
    image: question.image || null,
    timeLimit: question.timeLimit,
    answers:
      question.type === 'input'
        ? []
        : question.answers.map((a) => ({ id: a.id, text: a.text })),
  }
}
