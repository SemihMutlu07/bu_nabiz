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

// Clicking a chip fills (or clears) the note textarea directly.
const PRESETS = [
  'Ödevler yetişmiyor.',
  'Sınavlar üst üste geldi.',
  'Odak bulamıyorum.',
  'Uyku düzenim mahvoldu.',
  'Staj kaygısı var.',
  'Proje grubum çalışmıyor.',
  'Çok şey üstlendim.',
  'Geçer, biliyorum.',
]

export default function ShareForm({ week, onPostCreated }: Props) {
  const [open, setOpen]           = useState(false)
  const [status, setStatus]       = useState<Status | null>(null)
  const [intensity, setIntensity] = useState<number | null>(null)
  const [note, setNote]           = useState('')
  const [category, setCategory]   = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState(false)

  // Derived visibility flags
  const step1Done    = status !== null && intensity !== null
  const showExtras   = step1Done                      // extras section expands
  const showCategory = note.trim().length > 0         // category only when text typed

  function reset() {
    setStatus(null); setIntensity(null)
    setNote(''); setCategory(null)
    setError(null); setSuccess(false)
  }

  function close() { setOpen(false); reset() }

  async function handleSubmit() {
    if (!status || !intensity) return

    const cooldown = checkCooldown()
    if (!cooldown.ok) { setError(cooldown.message); return }

    const noteText = note.trim()
    if (noteText) {
      const check = validateCustomText(noteText)
      if (!check.ok) { setError(check.message); return }
    }

    setSubmitting(true)
    setError(null)
    try {
      await addDoc(collection(db, 'posts'), {
        week,
        category,
        status,
        intensity,
        custom_text:  noteText || null,
        micro_step:   null,
        me_too_count: 0,
        created_at:   serverTimestamp(),
      })
      recordPost()
      setSuccess(true)
      setTimeout(() => { close(); onPostCreated() }, 900)
    } catch (err) {
      console.error(err)
      setError('Bir şeyler ters gitti, tekrar deneyebilirsin.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Closed trigger ────────────────────────────────────────────
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full min-h-[44px] py-3 rounded-2xl border border-dashed border-rim text-sm text-dim hover:border-ink/40 hover:text-ink transition-colors"
      >
        + Bu haftaki durumunu paylaş
      </button>
    )
  }

  return (
    <div className="bg-surface border border-rim rounded-2xl p-4 sm:p-5">

      {/* ── Step 1 — Status + Intensity (always visible) ────────── */}
      <div className="space-y-4">

        <div className="space-y-2">
          <p className="text-[10px] font-medium text-dim/70 uppercase tracking-widest">Nasılsın?</p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(status === s ? null : s)}
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

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-[10px] font-medium text-dim/70 uppercase tracking-widest">Yoğunluk</p>
            <span className="text-[10px] text-dim/40">hafif → bunaltıcı</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setIntensity(intensity === n ? null : n)}
                className={`flex-1 h-11 rounded-xl text-sm font-medium transition-all ${
                  intensity === n
                    ? 'bg-ink text-bg'
                    : 'bg-bg text-dim border border-rim hover:border-ink/40 hover:text-ink'
                }`}
                aria-label={`Yoğunluk ${n}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Step 2 — extras (CSS expand when step1Done) ─────────── */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: showExtras ? '520px' : '0',
          opacity:   showExtras ? 1 : 0,
          transition: showExtras
            ? 'max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease 0.06s'
            : 'max-height 0.22s ease, opacity 0.15s ease',
        }}
      >
        <div className="pt-4 space-y-3">

          {/* Preset chips */}
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setNote(note === p ? '' : p)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  note === p
                    ? 'bg-ink text-bg border-ink'
                    : 'border-rim text-dim hover:border-ink/40 hover:text-ink'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Free note */}
          <div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value.slice(0, 160))}
              placeholder="Ya da kendi cümlen… (isteğe bağlı)"
              rows={2}
              className="w-full text-sm bg-bg text-ink border border-rim rounded-xl px-4 py-3 placeholder-dim/40 resize-none focus:outline-none focus:border-ink/30 focus:ring-1 focus:ring-ink/10 transition-colors"
            />
            {note.length > 100 && (
              <p className="text-xs text-dim text-right mt-1">{160 - note.length} kaldı</p>
            )}
          </div>

          {/* Category — slides in only when text is present */}
          <div
            style={{
              overflow: 'hidden',
              maxHeight: showCategory ? '80px' : '0',
              opacity:   showCategory ? 1 : 0,
              transition: showCategory
                ? 'max-height 0.28s ease, opacity 0.2s ease 0.05s'
                : 'max-height 0.18s ease, opacity 0.12s ease',
            }}
          >
            <div className="pt-1 flex flex-wrap gap-1.5">
              <span className="self-center text-[10px] text-dim/50 mr-1">kaynak:</span>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(category === cat ? null : cat)}
                  className={`min-h-[32px] text-xs px-3 py-1 rounded-full transition-all ${
                    category === cat
                      ? `${CATEGORY_COLORS[cat]} ring-1 ring-inset ring-current/30`
                      : 'bg-bg text-dim hover:bg-rim/30'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-3 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      {/* ── Actions ─────────────────────────────────────────────── */}
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={close}
          className="flex-1 min-h-[44px] rounded-xl text-sm text-dim hover:bg-rim/30 transition-colors"
        >
          İptal
        </button>
        <button
          type="button"
          disabled={!step1Done || submitting || success}
          onClick={handleSubmit}
          className={`flex-1 min-h-[44px] rounded-xl text-sm font-medium transition-all ${
            success
              ? 'bg-rim/40 text-dim cursor-default'
              : step1Done
              ? 'bg-ink text-bg hover:opacity-80 active:scale-[0.98]'
              : 'bg-ink/15 text-ink/30 cursor-not-allowed'
          }`}
        >
          {success ? 'Paylaşıldı ✓' : submitting ? '…' : 'Paylaş'}
        </button>
      </div>

    </div>
  )
}
