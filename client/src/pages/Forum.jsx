import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import VerifiedBadge from '../components/VerifiedBadge.jsx'
import ReactionIcon, { REACTION_LABELS } from '../components/icons/ReactionIcon.jsx'
import { RepostIcon, ShareIcon, TrashIcon } from '../components/icons/SocialIcons.jsx'
import { useAuth } from '../lib/AuthContext.jsx'
import { api } from '../lib/api.js'
import { getGuestKey, getGuestName, setGuestName } from '../lib/forum.js'
import { fadeUp, stagger } from '../lib/motion.js'

const REACTIONS = Object.keys(REACTION_LABELS)

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'hozir'
  if (s < 3600) return `${Math.floor(s / 60)} daq oldin`
  if (s < 86400) return `${Math.floor(s / 3600)} soat oldin`
  return `${Math.floor(s / 86400)} kun oldin`
}

function Avatar({ author }) {
  if (author.avatar) return <img src={author.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
  return (
    <span className="grid h-10 w-10 place-items-center rounded-full bg-samarkand text-sm font-extrabold text-white">
      {author.name?.[0]?.toUpperCase() || '?'}
    </span>
  )
}

function ReactionBar({ post, onReact }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1">
      {REACTIONS.map((type) => {
        const count = post.reactions[type] || 0
        const mine = post.myReaction === type
        return (
          <button
            key={type}
            type="button"
            onClick={() => onReact(post.id, type)}
            title={REACTION_LABELS[type]}
            className={`flex items-center gap-1 rounded-full border px-2 py-1 transition-colors ${
              mine ? 'border-samarkand bg-samarkand/15' : 'border-white/10 hover:border-white/25'
            }`}
          >
            <ReactionIcon type={type} size={16} />
            {count > 0 && <span className="text-xs font-bold text-ink-soft">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}

function PostCard({ post, teacher, onReact, onRepost, onShare, onDelete }) {
  const canDelete = teacher && post.authorType === 'teacher' && post.authorId === teacher.id

  return (
    <motion.div variants={fadeUp} className="card !p-4">
      {post.repostOf && (
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-ink-soft">
          <RepostIcon size={14} /> {post.name} repost qildi
        </p>
      )}

      {post.repostOf?.deleted ? (
        <p className="rounded-xl border border-white/10 bg-cream-deep p-3 text-sm text-ink-soft">
          Asl post o'chirilgan
        </p>
      ) : (
        <div className="flex items-start gap-3">
          <Avatar author={post.repostOf || post} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-ink">{(post.repostOf || post).name}</span>
              {(post.repostOf || post).isVerified && <VerifiedBadge size={15} />}
              <span className="text-xs text-ink-soft">
                · {timeAgo((post.repostOf || post).createdAt)}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-ink">
              {(post.repostOf || post).content}
            </p>

            {!post.repostOf && <ReactionBar post={post} onReact={onReact} />}

            <div className="mt-2 flex items-center gap-4">
              <button
                type="button"
                onClick={() => onRepost(post.id)}
                className="text-ink-soft transition-colors hover:text-chaman"
                title="Repost"
              >
                <RepostIcon size={18} />
              </button>
              <button
                type="button"
                onClick={() => onShare(post.id)}
                className="text-ink-soft transition-colors hover:text-samarkand-light"
                title="Ulashish"
              >
                <ShareIcon size={18} />
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(post.id)}
                  className="text-ink-soft transition-colors hover:text-anor"
                  title="O'chirish"
                >
                  <TrashIcon size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function Forum() {
  const { teacher } = useAuth()
  const [posts, setPosts] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [guestName, setGuestNameLocal] = useState(getGuestName())
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState(null)
  const [shareMsg, setShareMsg] = useState(null)

  const guestKey = !teacher ? getGuestKey() : null

  async function load(cursor) {
    const qs = new URLSearchParams()
    if (cursor) qs.set('cursor', cursor)
    if (guestKey) qs.set('guestKey', guestKey)
    const data = await api.get(`/forum/posts?${qs.toString()}`)
    setPosts((prev) => (cursor ? [...prev, ...data.posts] : data.posts))
    setNextCursor(data.nextCursor)
  }

  useEffect(() => {
    setLoading(true)
    load(null).finally(() => setLoading(false))
  }, [teacher])

  async function submit(e) {
    e.preventDefault()
    if (!content.trim()) return
    if (!teacher && !guestName.trim()) {
      setError('Ismingizni kiriting')
      return
    }
    setPosting(true)
    setError(null)
    try {
      if (!teacher) setGuestName(guestName.trim())
      const post = await api.post('/forum/posts', {
        content: content.trim(),
        guestName: guestName.trim(),
        guestKey,
      })
      setPosts((prev) => [post, ...prev])
      setContent('')
    } catch (err) {
      setError(err.message)
    } finally {
      setPosting(false)
    }
  }

  async function react(postId, emoji) {
    const res = await api.post(`/forum/posts/${postId}/react`, { emoji, guestKey })
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, myReaction: res.myReaction, reactions: res.reactions } : p)),
    )
  }

  async function repost(postId) {
    if (!teacher && !guestName.trim()) {
      setError('Repost qilish uchun avval ismingizni yozish maydoniga kiriting')
      return
    }
    const post = await api.post(`/forum/posts/${postId}/repost`, { guestName: guestName.trim(), guestKey })
    setPosts((prev) => [post, ...prev])
  }

  async function share(postId) {
    const url = `${window.location.origin}/forum?post=${postId}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Kahoot UZ forum', url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShareMsg(postId)
      setTimeout(() => setShareMsg(null), 2000)
    } catch {
      /* foydalanuvchi ulashishni bekor qilgan bo'lishi mumkin */
    }
  }

  async function removePost(postId) {
    if (!confirm("Postni o'chirmoqchimisiz?")) return
    await api.del(`/forum/posts/${postId}`)
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-cream/85 backdrop-blur">
        <div className="section flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" width={36} height={36} />
            <span className="font-display text-lg font-extrabold text-ink">
              Kahoot <span className="text-samarkand">UZ</span>
            </span>
          </Link>
          <Link to={teacher ? '/testlarim' : '/'} className="btn-ghost !px-3 !py-2 text-sm">
            {teacher ? 'Testlarim' : 'Bosh sahifa'}
          </Link>
        </div>
      </header>
      <main className="section max-w-2xl py-10">
        <h1 className="font-display text-3xl font-extrabold text-ink">💬 Forum</h1>
        <p className="mt-2 text-ink-soft">O'qituvchi va o'quvchilar fikr almashadigan ochiq lenta.</p>

        <form onSubmit={submit} className="card mt-6">
          {!teacher && (
            <input
              value={guestName}
              onChange={(e) => setGuestNameLocal(e.target.value.slice(0, 40))}
              placeholder="Ismingiz"
              className="field mb-3"
            />
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 500))}
            placeholder="Nima deysiz?"
            rows={3}
            className="field resize-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-ink-soft">{content.length}/500</span>
            <button
              type="submit"
              disabled={posting || !content.trim()}
              className="btn-primary !px-5 !py-2 text-sm disabled:opacity-50"
            >
              {posting ? 'Yuborilmoqda…' : 'Yuborish'}
            </button>
          </div>
          {error && <p className="mt-2 text-sm font-bold text-anor">{error}</p>}
        </form>

        <motion.div variants={stagger} initial="hidden" animate="show" className="mt-6 space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="relative">
              <PostCard
                post={p}
                teacher={teacher}
                onReact={react}
                onRepost={repost}
                onShare={share}
                onDelete={removePost}
              />
              {shareMsg === p.id && (
                <span className="absolute right-4 top-3 rounded-full bg-chaman px-2 py-0.5 text-xs font-bold text-white">
                  Havola nusxalandi ✓
                </span>
              )}
            </div>
          ))}

          {!loading && posts.length === 0 && (
            <p className="py-10 text-center text-ink-soft">Hali post yo'q — birinchi bo'lib yozing!</p>
          )}
        </motion.div>

        {nextCursor && (
          <button type="button" onClick={() => load(nextCursor)} className="btn-ghost mt-4 w-full justify-center">
            Ko'proq yuklash
          </button>
        )}
      </main>
    </div>
  )
}
