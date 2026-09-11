// Gemini bilan ishlash — savolni tekshirish va mavzu bo'yicha savol yaratish.
// Barcha SDK chaqiruvlari shu faylda izolyatsiya qilingan: model/SDK o'zgarsa faqat shu joy tahrirlanadi.

import { GoogleGenAI, Type } from '@google/genai'

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'

let client = null
function getClient() {
  if (!process.env.GEMINI_API_KEY) return null
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  return client
}

export function geminiEnabled() {
  return Boolean(process.env.GEMINI_API_KEY)
}

const checkSchema = {
  type: Type.OBJECT,
  properties: {
    ok: { type: Type.BOOLEAN, description: 'Savolda jiddiy xato yo‘qmi' },
    issues: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestion: { type: Type.STRING, description: 'Tuzatilgan savol matni (ixtiyoriy)' },
  },
  required: ['ok', 'issues'],
}

const questionSchema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ['quiz', 'multi', 'truefalse', 'input'] },
    text: { type: Type.STRING },
    timeLimit: { type: Type.NUMBER },
    answers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          correct: { type: Type.BOOLEAN },
        },
        required: ['text', 'correct'],
      },
    },
  },
  required: ['type', 'text', 'answers'],
}

const generateSchema = {
  type: Type.OBJECT,
  properties: {
    questions: { type: Type.ARRAY, items: questionSchema },
  },
  required: ['questions'],
}

/** Qo'lda kiritilgan savolni tekshiradi: grammatika, mantiq, to'g'ri javob mosligi */
export async function checkQuestion({ type, text, answers, subject }) {
  const ai = getClient()
  if (!ai) throw new Error('GEMINI_API_KEY sozlanmagan (server/.env)')

  const prompt = `Siz ingliz tili o'qituvchisiga yordam beruvchi yordamchisiz. Quyidagi test savolini tekshiring.
Fan/mavzu: ${subject || "Ingliz tili"}
Savol turi: ${type}
Savol matni: ${text}
Javob variantlari (to'g'ri/noto'g'ri belgisi bilan): ${JSON.stringify(answers)}

Tekshiring:
1) Savol grammatik jihatdan to'g'ri va tushunarlimi?
2) Belgilangan to'g'ri javob(lar) haqiqatan ham to'g'rimi?
3) Javob variantlari orasida noaniqlik yoki takror bormi?
Javobni o'zbek tilida, JSON sxemasiga mos qaytaring. Jiddiy muammo bo'lmasa ok=true qiling.`

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json', responseSchema: checkSchema },
  })

  return JSON.parse(response.text)
}

/** Mavzu bo'yicha savollar to'plamini yaratadi, so'ng o'zi qayta tekshirib chiqadi */
export async function generateQuestions({ topic, count, level, types }) {
  const ai = getClient()
  if (!ai) throw new Error('GEMINI_API_KEY sozlanmagan (server/.env)')

  const typeHint = types?.length ? types.join(', ') : 'quiz, multi, truefalse, input'
  const draftPrompt = `Siz ingliz tili o'qituvchisi uchun Kahoot uslubidagi test savollarini tuzuvchi yordamchisiz.
Mavzu: ${topic}
Daraja/sinf: ${level || 'aralash'}
Savollar soni: ${count}
Ruxsat etilgan savol turlari: ${typeHint} (quiz=bitta to'g'ri javob, multi=bir nechta to'g'ri javob, truefalse=to'g'ri/noto'g'ri, input=yozma javob)

Har bir savol ingliz tili bilimini tekshirsin (grammatika, lug'at, o'qish tushunish va h.k. mavzuga mos ravishda).
quiz/multi/truefalse uchun 2-4 ta javob varianti bering, faqat to'g'ri(lar)ni correct=true qiling.
input turi uchun bitta yoki bir nechta qabul qilinadigan to'g'ri javob matnini bering (barchasi correct=true).
timeLimit'ni 15-30 oralig'ida tanlang. JSON sxemaga qat'iy mos qaytaring.`

  const draft = await ai.models.generateContent({
    model: MODEL,
    contents: draftPrompt,
    config: { responseMimeType: 'application/json', responseSchema: generateSchema },
  })
  const draftQuestions = JSON.parse(draft.text).questions || []

  const reviewPrompt = `Quyidagi ingliz tili test savollarini yana bir marta diqqat bilan tekshiring: grammatik xatolarni tuzating,
noto'g'ri belgilangan "correct" bayroqlarini tuzating, tushunarsiz savollarni aniqlashtiring. Yakuniy, nashrga tayyor
variantni xuddi shu JSON sxemada qaytaring (savollar sonini o'zgartirmang):
${JSON.stringify(draftQuestions)}`

  const reviewed = await ai.models.generateContent({
    model: MODEL,
    contents: reviewPrompt,
    config: { responseMimeType: 'application/json', responseSchema: generateSchema },
  })
  const final = JSON.parse(reviewed.text).questions

  return Array.isArray(final) && final.length ? final : draftQuestions
}
