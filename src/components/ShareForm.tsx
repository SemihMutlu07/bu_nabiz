'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import type { Category, Status } from '@/lib/types'
import {
  CATEGORY_LABELS, CATEGORY_COLORS,
  STATUS_LABELS, STATUS_COLORS,
  CATEGORIES, STATUSES,
} from '@/lib/constants'
import { validateCustomText, checkCooldown, recordPost } from '@/lib/validation'

interface Props {
  week: string
  onPostCreated: () => void
}

export default function ShareForm({ week, onPostCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<Category | null>(null)
  const [status, setStatus] = useState<Status | null>(null)
  const [intensity, setIntensity] = useState<number | null>(null)
  const [customText, setCustomText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function reset() {
    setCategory(null)
    setStatus(null)
    setIntensity(null)
    setCustomText('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !status || !intensity) {
      setError('Kategori, durum ve yoğunluk zorunlu.')
      return
    }

    const cooldown = checkCooldown()
    if (!cooldown.ok) { setError(cooldown.message); return }

    const textCheck = validateCustomText(customText)
    if (!textCheck.ok) { setError(textCheck.message); return }

    setSubmitting(true)
    setError(null)
    try {
      await addDoc(collection(db, 'posts'), {
        week,
        category,
        status,
        intensity,
        custom_text: customText.trim() || null,
        micro_step: null,
        me_too_count: 0,
        created_at: serverTimestamp(),
      })
      recordPost()
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setOpen(false)
        reset()
        onPostCreated()
      }, 900)
    } catch (err) {
      console.error(err)
      setError('Bir şeyler ters gitti, tekrar deneyebilirsin.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full min-h-[44px] py-3 rounded-2xl border border-dashed border-rim text-sm text-dim hover:border-accent/60 hover:text-accent transition-colors"
      >
        + Bu haftaki yükünü paylaş
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-rim rounded-2xl p-4 sm:p-5 space-y-5">

      {/* Category */}
      <div className="space-y-2.5">
        <p className="text-xs font-medium text-dim uppercase tracking-wide">Kategori</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`min-h-[44px] text-sm px-4 py-2 rounded-full transition-all ${
                category === cat
                  ? `${CATEGORY_COLORS[cat]} ring-1 ring-inset ring-current/40`
                  : 'bg-bg text-dim hover:bg-rim/30'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2.5">
        <p className="text-xs font-medium text-dim uppercase tracking-wide">Durum</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`min-h-[44px] text-sm px-4 py-2 rounded-full transition-all ${
                status === s
                  ? `${STATUS_COLORS[s]} ring-1 ring-inset ring-current/40`
                  : 'bg-bg text-dim hover:bg-rim/30'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Intensity — 44px square touch targets */}
      <div className="space-y-2.5">
        <p className="text-xs font-medium text-dim uppercase tracking-wide">Yoğunluk</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setIntensity(n)}
              className={`w-11 h-11 rounded-xl text-sm font-medium transition-all ${
                intensity === n
                  ? 'bg-ink text-bg'
                  : 'bg-bg text-dim border border-rim hover:border-accent/50 hover:text-accent'
              }`}
              aria-label={`Yoğunluk ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Optional text */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-dim uppercase tracking-wide">
          Ne oluyor? <span className="normal-case font-normal">(isteğe bağlı)</span>
        </p>
        <textarea
          value={customText}
          onChange={e => setCustomText(e.target.value.slice(0, 200))}
          placeholder="Maksimum 200 karakter..."
          rows={3}
          className="w-full text-sm bg-bg text-ink border border-rim rounded-xl px-4 py-3 placeholder-dim/40 resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
        />
        {customText.length > 150 && (
          <p className="text-xs text-dim text-right">{200 - customText.length} kaldı</p>
        )}
      </div>

      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

      {/* Actions — min 44px height */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => { setOpen(false); reset() }}
          className="flex-1 min-h-[44px] rounded-xl text-sm text-dim hover:bg-rim/30 transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={submitting || success}
          className={`flex-1 min-h-[44px] rounded-xl text-sm font-medium transition-all ${
            success
              ? 'bg-rim/40 text-dim cursor-default'
              : 'bg-ink text-bg hover:opacity-80 active:scale-[0.98]'
          }`}
        >
          {success ? 'Paylaşıldı ✓' : submitting ? '...' : 'Paylaş'}
        </button>
      </div>
    </form>
  )
}
