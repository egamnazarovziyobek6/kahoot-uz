// Yangi o'qituvchi birinchi marta kirganda ko'radigan namuna test —
// client/src/lib/quiz.js dagi data-model bilan bir xil shaklda (id'lar shu yerda mustaqil yaratiladi).

import { randomUUID } from 'node:crypto'

function answer(text, correct = false) {
  return { id: randomUUID(), text, correct }
}

function question(type, text, answers, extra = {}) {
  return {
    id: randomUUID(),
    type,
    text,
    image: null,
    timeLimit: 20,
    points: 'standard',
    answers,
    ...extra,
  }
}

export function buildSampleQuiz() {
  const now = Date.now()
  return {
    id: randomUUID(),
    title: 'Present Simple — asoslari',
    description:
      "Ingliz tili grammatikasi bo'yicha 5 ta savoldan iborat namuna test. Tahrirlang yoki o'zingiznikini yarating.",
    subject: 'Grammatika',
    grade: '5–6-sinf',
    cover: null,
    themeColor: '#0E7C9D',
    visibility: 'private',
    createdAt: now,
    updatedAt: now,
    questions: [
      question(
        'quiz',
        'She ___ to school every day.',
        [answer('go', false), answer('goes', true), answer('going', false), answer('gone', false)],
        { timeLimit: 20 },
      ),
      question(
        'quiz',
        "Choose the correct question: ___ you like tea?",
        [answer('Does', false), answer('Do', true), answer('Are', false), answer('Is', false)],
        { timeLimit: 20 },
      ),
      question(
        'truefalse',
        'The sentence "He don\'t like coffee." is grammatically correct.',
        [answer("To'g'ri", false), answer("Noto'g'ri", true)],
        { timeLimit: 15 },
      ),
      question(
        'multi',
        'Which of these are Present Simple time expressions?',
        [
          answer('always', true),
          answer('usually', true),
          answer('yesterday', false),
          answer('every day', true),
        ],
        { timeLimit: 25 },
      ),
      question('input', 'Complete: "I ___ (live) in Tashkent."', [answer('live', true)], {
        timeLimit: 20,
        points: 'double',
      }),
    ],
  }
}
