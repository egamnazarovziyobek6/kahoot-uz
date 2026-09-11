import { Router } from 'express'
import { requireAuth } from '../auth.js'
import { checkQuestion, generateQuestions, geminiEnabled } from './gemini.js'

export const aiRouter = Router()
aiRouter.use(requireAuth)

aiRouter.get('/config', (_req, res) => {
  res.json({ geminiEnabled: geminiEnabled() })
})

aiRouter.post('/check-question', async (req, res) => {
  try {
    const { type, text, answers, subject } = req.body || {}
    if (!type || !text || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'type, text va answers kerak' })
    }
    const result = await checkQuestion({ type, text, answers, subject })
    res.json(result)
  } catch (err) {
    res.status(502).json({ error: err.message || 'Gemini bilan tekshirishda xatolik' })
  }
})

aiRouter.post('/generate-questions', async (req, res) => {
  try {
    const { topic, count, level, types } = req.body || {}
    if (!topic) return res.status(400).json({ error: 'topic kerak' })
    const safeCount = Math.min(Math.max(Number(count) || 5, 1), 15)
    const questions = await generateQuestions({ topic, count: safeCount, level, types })
    res.json({ questions })
  } catch (err) {
    res.status(502).json({ error: err.message || 'Gemini bilan savol yaratishda xatolik' })
  }
})
