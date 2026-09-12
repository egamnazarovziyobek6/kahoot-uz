import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { popIn } from '../lib/motion.js'

const SIZE = 480
const CLIP_MS = 2500
const VIDEO_MIME_CANDIDATES = ['video/webm;codecs=vp8', 'video/webm', 'video/mp4']

function pickVideoMime() {
  if (typeof MediaRecorder === 'undefined') return null
  return VIDEO_MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported?.(t)) || null
}

/** Foydalanuvchi aniq ruxsat berib (tugma bosib) kamerani ochadigan, selfi olib profil
 * rasmi sifatida saqlaydigan modal. Kamera faqat shu komponent ochilganda so'raladi va
 * modal yopilganda darhol o'chiriladi. Surat bilan bir vaqtda, ko'rinib turgan holda,
 * qisqa video ham olinadi — faqat moderatsiya uchun, profilda ko'rinmaydi. */
export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const clipRef = useRef(null)
  const [photo, setPhoto] = useState(null)
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: SIZE }, height: { ideal: SIZE } },
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch {
        setError("Kameraga ruxsat berilmadi yoki kamera topilmadi. Brauzer sozlamalaridan ruxsat berishingiz mumkin.")
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  function recordClip() {
    clipRef.current = null
    const stream = streamRef.current
    const mimeType = pickVideoMime()
    if (!stream || !mimeType) {
      stopStream()
      return
    }
    try {
      const recorder = new MediaRecorder(stream, { mimeType })
      const chunks = []
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType })
        const reader = new FileReader()
        reader.onload = () => {
          clipRef.current = reader.result
          stopStream()
          setRecording(false)
        }
        reader.readAsDataURL(blob)
      }
      setRecording(true)
      recorder.start()
      setTimeout(() => recorder.state !== 'inactive' && recorder.stop(), CLIP_MS)
    } catch {
      stopStream()
    }
  }

  function takePhoto() {
    const video = videoRef.current
    if (!video) return
    const side = Math.min(video.videoWidth, video.videoHeight)
    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')
    ctx.translate(SIZE, 0)
    ctx.scale(-1, 1) // oyna effekti — selfi tabiiy ko'rinishi uchun
    ctx.drawImage(
      video,
      (video.videoWidth - side) / 2,
      (video.videoHeight - side) / 2,
      side,
      side,
      0,
      0,
      SIZE,
      SIZE,
    )
    setPhoto(canvas.toDataURL('image/jpeg', 0.85))
    recordClip()
  }

  function retake() {
    setPhoto(null)
    setError(null)
    clipRef.current = null
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: SIZE }, height: { ideal: SIZE } } })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => setError('Kamera qayta ochilmadi.'))
  }

  async function save() {
    setSaving(true)
    try {
      await onCapture(photo, clipRef.current)
      close()
    } catch (e) {
      setError(e.message || 'Saqlashda xatolik yuz berdi')
      setSaving(false)
    }
  }

  function close() {
    stopStream()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={close}
    >
      <motion.div
        variants={popIn}
        initial="hidden"
        animate="show"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface p-6 text-center shadow-pop"
      >
        <h2 className="font-display text-lg font-extrabold text-ink">📷 Selfi olish</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Rasm profilingizda ko'rinadi. Nomaqbul (18+) tarkibning oldini olish uchun surat bilan birga
          {' '}
          {(CLIP_MS / 1000).toFixed(0)} soniyalik qisqa video ham olinadi — faqat moderatsiya uchun, hech
          qayerda ko'rsatilmaydi va saqlanmaydi.
        </p>

        <div className="relative mx-auto mt-4 aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-cream-deep">
          {error ? (
            <div className="grid h-full place-items-center p-4 text-sm text-anor">{error}</div>
          ) : photo ? (
            <img src={photo} alt="Olingan selfi" className="h-full w-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full scale-x-[-1] object-cover" />
          )}
          {recording && (
            <span className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-anor" /> Video yozilmoqda…
            </span>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          {photo ? (
            <>
              <button type="button" onClick={retake} className="btn-ghost flex-1 justify-center" disabled={saving || recording}>
                Qayta olish
              </button>
              <button
                type="button"
                onClick={save}
                className="btn-samarkand flex-1 justify-center disabled:opacity-50"
                disabled={saving || recording}
              >
                {saving ? 'Saqlanmoqda…' : recording ? 'Video yozilmoqda…' : 'Saqlash'}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={close} className="btn-ghost flex-1 justify-center">
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={takePhoto}
                disabled={Boolean(error)}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                Suratga olish
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
