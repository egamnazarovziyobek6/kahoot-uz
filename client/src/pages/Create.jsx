import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import QuestionRail from '../components/create/QuestionRail.jsx'
import QuestionEditor from '../components/create/QuestionEditor.jsx'
import SettingsDrawer from '../components/create/SettingsDrawer.jsx'
import PreviewModal from '../components/create/PreviewModal.jsx'
import {
  makeQuiz,
  makeQuestion,
  makeAnswer,
  cloneQuestion,
  validateQuiz,
  estimateDuration,
  MAX_ANSWERS,
  MIN_ANSWERS,
} from '../lib/quiz.js'
import { getQuiz, saveQuiz, listQuizzes } from '../lib/quizStore.js'

const isChoiceType = (t) => t === 'quiz' || t === 'multi'

/** Savol turini almashtirish — imkon qadar javoblarni saqlab qolamiz */
function changeType(prev, type) {
  if (prev.type === type) return prev

  const carry = {
    text: prev.text,
    image: prev.image,
    timeLimit: prev.timeLimit,
    points: prev.points,
  }
  const fresh = makeQuestion(type)

  // viktorina ↔ ko‘p javobli: javoblar saqlanadi
  if (isChoiceType(prev.type) && isChoiceType(type)) {
    let answers = prev.answers
    if (type === 'quiz') {
      let kept = false
      answers = answers.map((a) => {
        const correct = a.correct && !kept
        if (correct) kept = true
        return { ...a, correct }
      })
    }
    return { ...prev, ...carry, type, answers }
  }

  // tanlovli → yozma javob: to‘g‘ri javoblar matnini ko‘chiramiz
  if (type === 'input' && isChoiceType(prev.type)) {
    const accepted = prev.answers.filter((a) => a.correct && a.text.trim())
    return {
      ...fresh,
      ...carry,
      answers: accepted.length ? accepted.map((a) => makeAnswer(a.text, true)) : fresh.answers,
    }
  }

  return { ...fresh, ...carry }
}

function reducer(state, action) {
  const { quiz } = state
  const mapQ = (fn) => ({ ...quiz, questions: quiz.questions.map(fn) })

  switch (action.type) {
    case 'load':
      return { quiz: action.quiz, selectedId: action.quiz.questions[0]?.id ?? null }

    case 'meta':
      return { ...state, quiz: { ...quiz, ...action.patch } }

    case 'addQuestion': {
      const nq = makeQuestion(action.qtype || 'quiz')
      return { quiz: { ...quiz, questions: [...quiz.questions, nq] }, selectedId: nq.id }
    }

    case 'duplicateQuestion': {
      const i = quiz.questions.findIndex((q) => q.id === action.id)
      if (i < 0) return state
      const copy = cloneQuestion(quiz.questions[i])
      const questions = [...quiz.questions]
      questions.splice(i + 1, 0, copy)
      return { quiz: { ...quiz, questions }, selectedId: copy.id }
    }

    case 'deleteQuestion': {
      if (quiz.questions.length <= 1) return state
      const i = quiz.questions.findIndex((q) => q.id === action.id)
      const questions = quiz.questions.filter((q) => q.id !== action.id)
      const selectedId =
        state.selectedId === action.id
          ? questions[Math.max(0, i - 1)].id
          : state.selectedId
      return { quiz: { ...quiz, questions }, selectedId }
    }

    case 'move': {
      const i = quiz.questions.findIndex((q) => q.id === action.id)
      const j = i + action.dir
      if (i < 0 || j < 0 || j >= quiz.questions.length) return state
      const questions = [...quiz.questions]
      ;[questions[i], questions[j]] = [questions[j], questions[i]]
      return { ...state, quiz: { ...quiz, questions } }
    }

    case 'select':
      return { ...state, selectedId: action.id }

    case 'setType':
      return {
        ...state,
        quiz: mapQ((q) => (q.id === action.id ? changeType(q, action.qtype) : q)),
      }

    case 'patchQuestion':
      return {
        ...state,
        quiz: mapQ((q) => (q.id === action.id ? { ...q, ...action.patch } : q)),
      }

    case 'patchAnswer':
      return {
        ...state,
        quiz: mapQ((q) =>
          q.id !== action.qid
            ? q
            : {
                ...q,
                answers: q.answers.map((a) =>
                  a.id === action.aid ? { ...a, ...action.patch } : a,
                ),
              },
        ),
      }

    case 'toggleCorrect':
      return {
        ...state,
        quiz: mapQ((q) => {
          if (q.id !== action.qid) return q
          if (q.type === 'multi') {
            return {
              ...q,
              answers: q.answers.map((a) =>
                a.id === action.aid ? { ...a, correct: !a.correct } : a,
              ),
            }
          }
          return { ...q, answers: q.answers.map((a) => ({ ...a, correct: a.id === action.aid })) }
        }),
      }

    case 'addAnswer':
      return {
        ...state,
        quiz: mapQ((q) => {
          if (q.id !== action.qid) return q
          const cap = q.type === 'input' ? 6 : MAX_ANSWERS
          if (q.answers.length >= cap) return q
          return { ...q, answers: [...q.answers, makeAnswer('', q.type === 'input')] }
        }),
      }

    case 'removeAnswer':
      return {
        ...state,
        quiz: mapQ((q) => {
          if (q.id !== action.qid) return q
          const floor = q.type === 'input' ? 1 : MIN_ANSWERS
          if (q.answers.length <= floor) return q
          return { ...q, answers: q.answers.filter((a) => a.id !== action.aid) }
        }),
      }

    default:
      return state
  }
}

export default function Create() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(reducer, { quiz: null, selectedId: null })
  const [status, setStatus] = useState('idle') // idle | saving | saved
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const firstRun = useRef(true)
  const isNew = useRef(false)

  // Yuklash / yangi test yaratish
  useEffect(() => {
    firstRun.current = true
    if (id) {
      const found = getQuiz(id)
      if (found) {
        isNew.current = false
        dispatch({ type: 'load', quiz: found })
      } else {
        navigate('/yaratish', { replace: true })
      }
    } else {
      listQuizzes() // birinchi kirishda namuna testni yaratadi
      isNew.current = true
      dispatch({ type: 'load', quiz: makeQuiz() })
    }
  }, [id, navigate])

  // Avtomatik saqlash (faqat o'zgartirishdan keyin)
  const quiz = state.quiz
  useEffect(() => {
    if (!quiz) return
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setStatus('saving')
    const t = setTimeout(() => {
      const { ok } = saveQuiz(quiz)
      setStatus(ok ? 'saved' : 'idle')
      if (ok && isNew.current) {
        isNew.current = false
        navigate(`/yaratish/${quiz.id}`, { replace: true })
      }
    }, 700)
    return () => clearTimeout(t)
  }, [quiz, navigate])

  const validation = useMemo(() => (quiz ? validateQuiz(quiz) : null), [quiz])

  if (!quiz) {
    return (
      <div className="grid h-screen place-items-center bg-cream text-ink-soft">Yuklanmoqda…</div>
    )
  }

  const selected =
    quiz.questions.find((q) => q.id === state.selectedId) ?? quiz.questions[0]
  const selectedIndex = quiz.questions.findIndex((q) => q.id === selected.id)

  function finishAndExit() {
    if (!validation.ok) {
      setShowErrors(true)
      setSettingsOpen(!quiz.title.trim())
      return
    }
    saveQuiz(quiz)
    navigate('/testlarim')
  }

  return (
    <div className="flex h-screen flex-col bg-cream">
      {/* Yuqori panel */}
      <header className="flex items-center gap-3 border-b border-black/10 bg-white/80 px-3 py-2.5 backdrop-blur">
        <Link
          to="/testlarim"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-black/10 bg-white"
          title="Testlarim"
        >
          ←
        </Link>

        <input
          value={quiz.title}
          onChange={(e) => dispatch({ type: 'meta', patch: { title: e.target.value } })}
          placeholder="Nomsiz test"
          className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1 font-display text-base font-extrabold text-ink outline-none hover:bg-black/5 focus:bg-black/5"
        />

        <span className="hidden shrink-0 text-xs font-bold text-ink-soft sm:block">
          {status === 'saving' ? 'Saqlanmoqda…' : status === 'saved' ? 'Saqlandi ✓' : ''}
        </span>

        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="btn-ghost !px-3 !py-2 text-sm"
        >
          Ko‘rib chiqish
        </button>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="btn-ghost !px-3 !py-2 text-sm"
        >
          ⚙ <span className="hidden sm:inline">Sozlamalar</span>
        </button>
        <button type="button" onClick={finishAndExit} className="btn-samarkand !px-4 !py-2 text-sm">
          Saqlash
        </button>
      </header>

      {/* Ish maydoni */}
      <div className="flex flex-1 overflow-hidden">
        <QuestionRail
          questions={quiz.questions}
          selectedId={selected.id}
          onSelect={(qid) => dispatch({ type: 'select', id: qid })}
          onAdd={(qtype) => dispatch({ type: 'addQuestion', qtype })}
          onDuplicate={(qid) => dispatch({ type: 'duplicateQuestion', id: qid })}
          onDelete={(qid) => dispatch({ type: 'deleteQuestion', id: qid })}
          onMove={(qid, dir) => dispatch({ type: 'move', id: qid, dir })}
          errorsByIndex={validation.questions}
        />

        <main className="flex-1 overflow-y-auto">
          <QuestionEditor
            key={selected.id}
            question={selected}
            index={selectedIndex}
            total={quiz.questions.length}
            errors={showErrors ? validation.questions[selectedIndex] : []}
            onPatch={(patch) => dispatch({ type: 'patchQuestion', id: selected.id, patch })}
            onSetType={(qtype) => dispatch({ type: 'setType', id: selected.id, qtype })}
            onPatchAnswer={(aid, patch) =>
              dispatch({ type: 'patchAnswer', qid: selected.id, aid, patch })
            }
            onToggleCorrect={(aid) => dispatch({ type: 'toggleCorrect', qid: selected.id, aid })}
            onAddAnswer={() => dispatch({ type: 'addAnswer', qid: selected.id })}
            onRemoveAnswer={(aid) => dispatch({ type: 'removeAnswer', qid: selected.id, aid })}
            onPrev={() =>
              dispatch({ type: 'select', id: quiz.questions[Math.max(0, selectedIndex - 1)].id })
            }
            onNext={() =>
              dispatch({
                type: 'select',
                id: quiz.questions[Math.min(quiz.questions.length - 1, selectedIndex + 1)].id,
              })
            }
            onAdd={(qtype) => dispatch({ type: 'addQuestion', qtype })}
          />

          <p className="pb-8 text-center text-xs text-ink-soft">
            {quiz.questions.length} savol · {estimateDuration(quiz)}
          </p>
        </main>
      </div>

      <SettingsDrawer
        open={settingsOpen}
        quiz={quiz}
        onClose={() => setSettingsOpen(false)}
        onPatch={(patch) => dispatch({ type: 'meta', patch })}
      />

      <PreviewModal
        open={previewOpen}
        quiz={quiz}
        startIndex={selectedIndex}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  )
}
