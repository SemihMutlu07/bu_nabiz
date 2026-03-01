'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import type { Post, Category, Status } from '@/lib/types'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/constants'
import ThemeToggle from '@/components/ThemeToggle'

interface Props {
  week: string
}

export default function PulseStats({ week }: Props) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const weekNum = week.split('-W')[1]
  const yearNum = week.split('-W')[0]

  useEffect(() => {
    async function fetchPosts() {
      try {
        const q = query(collection(db, 'posts'), where('week', '==', week))
        const snap = await getDocs(q)
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)))
      } catch (err) {
        console.error('Pulse fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [week])

  const totalPosts = posts.length
  const totalMeToo = posts.reduce((sum, p) => sum + (p.me_too_count || 0), 0)

  const catCounts = posts.reduce<Record<string, number>>((acc, p) => {
    if (!p.category) return acc          // skip posts with no category
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})

  const statusCounts = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  const topCats     = Object.entries(catCounts).sort(([, a], [, b]) => b - a)
  const topStatuses = Object.entries(statusCounts).sort(([, a], [, b]) => b - a)

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink">Nabız</h1>
            <p className="text-sm text-dim mt-0.5">{yearNum} · {weekNum}. hafta</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href={`/w/${week}`}
              className="text-sm text-dim hover:text-ink transition-colors"
            >
              ← Geri
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface border border-rim rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : totalPosts === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-dim/60">Bu hafta henüz veri yok.</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface border border-rim rounded-2xl p-4">
                <p className="text-3xl font-semibold text-ink">{totalPosts}</p>
                <p className="text-xs text-dim mt-1">paylaşım</p>
              </div>
              <div className="bg-surface border border-rim rounded-2xl p-4">
                <p className="text-3xl font-semibold text-ink">{totalMeToo}</p>
                <p className="text-xs text-dim mt-1">ben de</p>
              </div>
            </div>

            {/* Categories */}
            {topCats.length > 0 && (
              <div className="bg-surface border border-rim rounded-2xl p-4 space-y-3">
                <p className="text-xs font-medium text-dim uppercase tracking-wide">Kategoriler</p>
                <div className="space-y-2.5">
                  {topCats.map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-sm text-ink/80 w-20 shrink-0">
                        {CATEGORY_LABELS[cat as Category]}
                      </span>
                      <div className="flex-1 bg-rim/40 rounded-full h-1.5">
                        <div
                          className="bg-accent rounded-full h-1.5 transition-all"
                          style={{ width: `${(count / totalPosts) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-dim w-5 text-right shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statuses */}
            {topStatuses.length > 0 && (
              <div className="bg-surface border border-rim rounded-2xl p-4 space-y-3">
                <p className="text-xs font-medium text-dim uppercase tracking-wide">Durumlar</p>
                <div className="space-y-2.5">
                  {topStatuses.map(([status, count]) => (
                    <div key={status} className="flex items-center gap-3">
                      <span className="text-sm text-ink/80 w-28 shrink-0">
                        {STATUS_LABELS[status as Status]}
                      </span>
                      <div className="flex-1 bg-rim/40 rounded-full h-1.5">
                        <div
                          className="bg-accent rounded-full h-1.5 transition-all"
                          style={{ width: `${(count / totalPosts) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-dim w-5 text-right shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
