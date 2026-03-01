'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import type { Post, Category, Status } from '@/lib/types'
import PostCard from '@/components/PostCard'
import ShareForm from '@/components/ShareForm'
import ThemeToggle from '@/components/ThemeToggle'
import WelcomeSheet from '@/components/WelcomeSheet'
import { CATEGORIES, STATUSES, CATEGORY_LABELS, STATUS_LABELS } from '@/lib/constants'

interface Props {
  week: string
}

export default function WeekFeed({ week }: Props) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<Category | null>(null)
  const [filterStatus, setFilterStatus] = useState<Status | null>(null)
  const [copied, setCopied] = useState(false)
  const [openSignal, setOpenSignal] = useState(0)

  const weekNum    = week.split('-W')[1]
  const yearNum    = week.split('-W')[0]
  const meTooTotal = posts.reduce((sum, p) => sum + (p.me_too_count || 0), 0)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, 'posts'),
        where('week', '==', week),
        orderBy('created_at', 'desc')
      )
      const snap = await getDocs(q)
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)))
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [week])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/w/${week}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const filtered = posts.filter(p => {
    if (filterCategory && p.category !== filterCategory) return false
    if (filterStatus && p.status !== filterStatus) return false
    return true
  })

  return (
    <div className="min-h-screen bg-bg">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src="/kutuphane.png"
          alt="Boğaziçi Kütüphanesi"
          fill
          className="object-cover object-center"
          priority
        />
        {/* gradient — darker at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/40 to-black/10" />

        {/* Top-right controls overlaid on hero */}
        <div className="absolute top-3 right-4 z-10 flex items-center gap-1">
          <button
            onClick={copyLink}
            title="Bu haftanın linkini kopyala"
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              copied
                ? 'border-white/30 bg-white/15 text-white'
                : 'border-white/20 bg-black/20 text-white/60 hover:text-white hover:border-white/40'
            }`}
          >
            {copied ? 'Kopyalandı ✅' : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Link
              </>
            )}
          </button>
          <ThemeToggle />
          <Link
            href={`/w/${week}/pulse`}
            className="text-xs text-white/60 hover:text-white transition-colors px-1"
          >
            Nabız →
          </Link>
        </div>

        {/* Bottom-left headline */}
        <div className="absolute bottom-0 left-0 right-0 z-10 max-w-2xl mx-auto px-5 pb-5">
          <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-white/45 mb-1.5">
            BÜ Nabız · {yearNum} · {weekNum}. hafta
          </p>
          <h1 className="text-[1.25rem] font-semibold text-white leading-snug">
            Boğaziçi&apos;de bu hafta yalnız değilsin.
          </h1>
          {!loading && posts.length > 0 && (
            <p className="text-xs text-white/50 mt-2 font-sans">
              {posts.length} paylaşım · {meTooTotal} ben de
            </p>
          )}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4">

        {/* Share form */}
        <div className="mt-5 mb-5">
          <ShareForm week={week} onPostCreated={fetchPosts} openSignal={openSignal} />
        </div>

        {/* Sticky filter bar */}
        <div className="sticky top-0 z-10 -mx-4 px-4 py-2.5 bg-bg/95 backdrop-blur-sm border-b border-rim/40 mb-4 space-y-1.5">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterCategory(null)}
              className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                filterCategory === null
                  ? 'bg-ink text-bg border-ink'
                  : 'border-rim text-dim hover:border-ink/40 hover:text-ink'
              }`}
            >
              Tümü
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                  filterCategory === cat
                    ? 'bg-ink text-bg border-ink'
                    : 'border-rim text-dim hover:border-ink/40 hover:text-ink'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterStatus(null)}
              className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                filterStatus === null
                  ? 'bg-ink text-bg border-ink'
                  : 'border-rim text-dim hover:border-ink/40 hover:text-ink'
              }`}
            >
              Tümü
            </button>
            {STATUSES.map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(filterStatus === st ? null : st)}
                className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                  filterStatus === st
                    ? 'bg-ink text-bg border-ink'
                    : 'border-rim text-dim hover:border-ink/40 hover:text-ink'
                }`}
              >
                {STATUS_LABELS[st]}
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface border border-rim rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          posts.length === 0 ? (
            /* ── Zero-post empty state: ghosted example cards + CTA ── */
            <div className="space-y-3 pb-8">
              <div className="opacity-50 pointer-events-none space-y-3" aria-hidden>
                {/* Example card 1 */}
                <article className="bg-surface border border-rim rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
                      Yorgunum
                    </span>
                    <div className="ml-auto flex gap-1 items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`w-2 h-2 rounded-full ${i < 3 ? 'bg-ink' : 'bg-rim'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium px-3 min-h-[36px] rounded-full border border-rim text-dim">
                      Ben de
                      <span className="inline-flex items-center justify-center min-w-[1.25rem] h-[1.125rem] px-1 rounded-full text-[10px] font-semibold bg-ink/10 text-ink/60">7</span>
                    </div>
                  </div>
                </article>
                {/* Example card 2 */}
                <article className="bg-surface border border-rim rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      Ders
                    </span>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                      Yetişemiyorum
                    </span>
                    <div className="ml-auto flex gap-1 items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`w-2 h-2 rounded-full ${i < 4 ? 'bg-ink' : 'bg-rim'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-ink leading-relaxed">Ödevler yetişmiyor.</p>
                  <div className="flex justify-end pt-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium px-3 min-h-[36px] rounded-full border border-rim text-dim">
                      Ben de
                      <span className="inline-flex items-center justify-center min-w-[1.25rem] h-[1.125rem] px-1 rounded-full text-[10px] font-semibold bg-ink/10 text-ink/60">12</span>
                    </div>
                  </div>
                </article>
                {/* Example card 3 */}
                <article className="bg-surface border border-rim rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300">
                      Fena değil
                    </span>
                    <div className="ml-auto flex gap-1 items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`w-2 h-2 rounded-full ${i < 2 ? 'bg-ink' : 'bg-rim'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium px-3 min-h-[36px] rounded-full border border-rim text-dim">
                      Ben de
                      <span className="inline-flex items-center justify-center min-w-[1.25rem] h-[1.125rem] px-1 rounded-full text-[10px] font-semibold bg-ink/10 text-ink/60">3</span>
                    </div>
                  </div>
                </article>
              </div>

              <div className="text-center py-4">
                <p className="text-sm text-dim/60 mb-3">Bu hafta henüz paylaşım yok. İlk sen ol.</p>
                <button
                  onClick={() => setOpenSignal(s => s + 1)}
                  className="min-h-[44px] px-6 rounded-xl text-sm font-medium bg-ink text-bg hover:opacity-80 active:scale-[0.98] transition-all"
                >
                  İlk paylaşımı yap
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-sm text-dim/60">Bu filtreyle eşleşen post yok.</p>
            </div>
          )
        ) : (
          <div className="space-y-3 pb-8">
            {filtered.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

      </div>

      <WelcomeSheet onPrimary={() => setOpenSignal(s => s + 1)} />
    </div>
  )
}
