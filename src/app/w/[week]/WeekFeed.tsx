'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import type { Post } from '@/lib/types'
import type { Category, Status } from '@/lib/types'
import PostCard from '@/components/PostCard'
import ShareForm from '@/components/ShareForm'
import ThemeToggle from '@/components/ThemeToggle'
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

  const weekNum = week.split('-W')[1]
  const yearNum = week.split('-W')[0]

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

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

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
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink">BÜ Nabız</h1>
            <p className="text-sm text-dim mt-0.5">{yearNum} · {weekNum}. hafta</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-1 text-xs text-dim hover:text-ink transition-colors px-2 py-1.5 rounded-lg border border-transparent hover:border-rim"
              title="Bu haftanın linkini kopyala"
            >
              {copied ? (
                <span>✓ Kopyalandı</span>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  <span>Link</span>
                </>
              )}
            </button>
            <ThemeToggle />
            <Link
              href={`/w/${week}/pulse`}
              className="text-sm text-dim hover:text-ink transition-colors"
            >
              Nabız →
            </Link>
          </div>
        </div>

        {/* Share form */}
        <div className="mb-5">
          <ShareForm week={week} onPostCreated={fetchPosts} />
        </div>

        {/* Sticky filter bar */}
        <div className="sticky top-0 z-10 -mx-4 px-4 py-2.5 bg-bg/95 backdrop-blur-sm border-b border-rim/40 mb-4 space-y-1.5">
          {/* Category row */}
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
          {/* Status row */}
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
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🌿</p>
            <p className="text-sm text-dim/60">
              {posts.length === 0
                ? 'Bu hafta henüz paylaşım yok.'
                : 'Bu filtreyle eşleşen post yok.'}
            </p>
            {posts.length === 0 && (
              <p className="text-xs text-dim/40 mt-1">İlk paylaşımı sen yap.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
