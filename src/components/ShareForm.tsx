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

// Preset sentences — curated, first-person, anonymous-safe
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

type Step = 0 | 1 | 2 | 3   // 0 = closed

export default function ShareForm({ week, onPostCreated }: Props) {
  const [step, setStep]         = useState<Step>(0)
  const [status, setStatus]     = useState<Status | null>(null)
  const [intensity, setIntensity] = useState<number | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [preset, setPreset]     = useState<string | null>(null)
  const [note, setNote]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  function reset() {
    setStatus(null); setIntensity(null); setCategory(null)
    setPreset(null); setNote(''); setError(null); setSuccess(false)
  }

  function close() { setStep(0); reset() }

  function pickStatus(s: Status) {
    setStatus(s)
    setTimeout(() => setStep(2), 130)
  }

  function pickIntensity(n: number) {
    setIntensity(n)
    setTimeout(() => setStep(3), 130)
  }

  async function handleSubmit() {
    if (!status || !intensity) return

    const cooldown = checkCooldown()
    if (!cooldown.ok) { setError(cooldown.message); return }

    const noteText = note.trim()
    if (noteText) {
      const check = validateCustomText(noteText)
      if (!check.ok) { setError(check.message); return }
    }

    const custom_text = noteText || preset || null

    setSubmitting(true)
    setError(null)
    try {
      await addDoc(collection(db, 'posts'), {
        week,
        category,
        status,
        intensity,
        custom_text,
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

  // ── Closed ────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <button
        onClick={() => setStep(1)}
        className="w-full min-h-[44px] py-3 rounded-2xl border border-dashed border-rim text-sm text-dim hover:border-ink/40 hover:text-ink transition-colors"
      >
        + Bu haftaki durumunu paylaş
      </button>
    )
  }

  // ── Progress bar ───────────────────────────────────────────────
  const dots = (
    <div className="flex items-center gap-1.5 mb-5">
      {([1, 2, 3] as const).map(s => (
        <div
          key={s}
          className={`h-[3px] rounded-full transition-all duration-300 ${
            s === step   ? 'w-8 bg-ink'
            : s < step   ? 'w-4 bg-ink/30'
            :              'w-4 bg-rim'
          }`}
        />
      ))}
    </div>
  )

  return (
    <div className="bg-surface border border-rim rounded-2xl p-4 sm:p-5">
      {dots}

      {/* ── Step 1 — Status ────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink">Bugün nasılsın?</p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => pickStatus(s)}
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
      )}

      {/* ── Step 2 — Intensity ─────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-ink">Ne kadar yoğun?</p>
            <span className="text-xs text-dim/60">hafif → bunaltıcı</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => pickIntensity(n)}
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
      )}

      {/* ── Step 3 — Optional extras ───────────────────────────── */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-ink">
            Eklemek ister misin?{' '}
            <span className="font-normal text-dim">isteğe bağlı</span>
          </p>

          {/* Category source */}
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-dim/70 uppercase tracking-widest">Kaynak</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(category === cat ? null : cat)}
                  className={`min-h-[36px] text-sm px-3.5 py-1 rounded-full transition-all ${
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

          {/* Preset chips */}
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-dim/70 uppercase tracking-widest">Hızlı seçim</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPreset(preset === p ? null : p)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    preset === p
                      ? 'bg-ink text-bg border-ink'
                      : 'border-rim text-dim hover:border-ink/40 hover:text-ink'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Short note */}
          <div className="space-y-1">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value.slice(0, 160))}
              placeholder="Kısa not… (max 160 karakter)"
              rows={2}
              className="w-full text-sm bg-bg text-ink border border-rim rounded-xl px-4 py-3 placeholder-dim/40 resize-none focus:outline-none focus:border-ink/30 focus:ring-1 focus:ring-ink/10 transition-colors"
            />
            {note.length > 100 && (
              <p className="text-xs text-dim text-right">{160 - note.length} kaldı</p>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      {/* ── Nav ────────────────────────────────────────────────── */}
      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={step === 1 ? close : () => setStep((step - 1) as Step)}
          className="flex-1 min-h-[44px] rounded-xl text-sm text-dim hover:bg-rim/30 transition-colors"
        >
          {step === 1 ? 'İptal' : '← Geri'}
        </button>

        {step === 3 && (
          <button
            type="button"
            disabled={submitting || success}
            onClick={handleSubmit}
            className={`flex-1 min-h-[44px] rounded-xl text-sm font-medium transition-all ${
              success
                ? 'bg-rim/40 text-dim cursor-default'
                : 'bg-ink text-bg hover:opacity-80 active:scale-[0.98]'
            }`}
          >
            {success ? 'Paylaşıldı ✓' : submitting ? '…' : 'Paylaş'}
          </button>
        )}
      </div>
    </div>
  )
}
