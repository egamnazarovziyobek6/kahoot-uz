// Testlar ombori — server API'siga saqlanadi (o'qituvchi hisobiga bog'langan).
// Funksiya nomlari avvalgi (localStorage) versiya bilan bir xil, endi async.

import { cloneQuiz } from './quiz.js'
import { api } from './api.js'

export async function listQuizzes() {
  return api.get('/quizzes')
}

export async function getQuiz(id) {
  try {
    return await api.get(`/quizzes/${id}`)
  } catch (e) {
    if (e.status === 404) return null
    throw e
  }
}

export async function saveQuiz(quiz) {
  try {
    const saved = await api.post('/quizzes', quiz)
    return { quiz: saved, ok: true }
  } catch (e) {
    console.warn('Testni saqlab bo‘lmadi:', e)
    return { quiz, ok: false }
  }
}

export async function deleteQuiz(id) {
  await api.del(`/quizzes/${id}`)
}

export async function duplicateQuiz(id) {
  const src = await getQuiz(id)
  if (!src) return null
  const copy = cloneQuiz(src, { title: `${src.title || 'Test'} (nusxa)` })
  const { quiz } = await saveQuiz(copy)
  return quiz
}
