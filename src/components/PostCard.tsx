'use client'

import { useState } from 'react'
import type { Post } from '@/lib/types'
import { CATEGORY_LABELS, CATEGORY_COLORS, STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import { db } from '@/lib/firebase'
import { doc, runTransaction, serverTimestamp, increment } from 'firebase/firestore'
import { getOrCreateFingerprint, sha256 } from '@/lib/utils'

interface Props {
  post: Post
}

export default function PostCard({ post }: Props) {
  const [count, setCount] = useState(post.me_too_count)
  const [voted, setVoted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pop, setPop] = useState(false)

  async function handleMeToo() {
    if (voted || busy) return
    setBusy(true)
    try {
      const fp = getOrCreateFingerprint()
      const hash = await sha256(fp)
      const eventId = `${post.id}_${hash}`
      const eventRef = doc(db, 'me_too_events', eventId)
      const postRef = doc(db, 'posts', post.id)

      let didCreate = false
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(eventRef)
        if (snap.exists()) return
        tx.set(eventRef, {
          post_id: post.id,
          fingerprint_hash: hash,
          created_at: serverTimestamp(),
        })
        tx.update(postRef, { me_too_count: increment(1) })
        didCreate = true
      })

      if (didCreate) {
        setCount(c => c + 1)
        setVoted(true)
        setPop(true)
        setTimeout(() => setPop(false), 200)
      }
    } catch (err) {
      console.error('Ben de error:', err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="bg-surface border border-rim rounded-2xl p-4 space-y-3">
      {/* Labels + intensity */}
      <div className="flex items-center gap-2 flex-wrap">
        {post.category && (
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[post.category]}`}>
            {CATEGORY_LABELS[post.category]}
          </span>
        )}
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[post.status]}`}>
          {STATUS_LABELS[post.status]}
        </span>
        <div className="ml-auto flex gap-1 items-center" aria-label={`Yoğunluk ${post.intensity}/5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i < post.intensity ? 'bg-ink' : 'bg-rim'}`}
            />
          ))}
        </div>
      </div>

      {post.custom_text && (
        <p className="text-sm text-ink leading-relaxed">{post.custom_text}</p>
      )}

      {post.micro_step && (
        <p className="text-xs text-dim border-l-2 border-rim pl-2.5 italic">
          {post.micro_step}
        </p>
      )}

      {/* Ben de */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleMeToo}
          disabled={voted || busy}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 min-h-[36px] rounded-full border transition-all ${
            voted
              ? 'border-ink/20 bg-ink/[0.06] text-ink/55 cursor-default'
              : 'border-rim text-dim hover:border-ink hover:text-ink active:scale-95 cursor-pointer'
          }`}
        >
          <span>{voted ? 'Ben de ✓' : 'Ben de'}</span>
          {count > 0 && (
            <span
              className="inline-flex items-center justify-center min-w-[1.25rem] h-[1.125rem] px-1 rounded-full text-[10px] font-semibold bg-ink/10 text-ink/60"
              style={{
                transform: pop ? 'scale(1.35)' : 'scale(1)',
                opacity: pop ? 1 : 0.8,
                transition: 'transform 300ms cubic-bezier(0.34,1.56,0.64,1), opacity 200ms ease',
              }}
            >
              {count}
            </span>
          )}
        </button>
      </div>
    </article>
  )
}
