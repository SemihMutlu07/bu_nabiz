'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import type { Post } from '@/lib/types'
import PostCard from '@/components/PostCard'
import ShareForm from '@/components/ShareForm'
import ThemeToggle from '@/components/ThemeToggle'

interface Props {
  week: string
}

export default function WeekFeed({ week }: Props) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink">BÜ Nabız</h1>
            <p className="text-sm text-dim mt-0.5">{yearNum} · {weekNum}. hafta</p>
          </div>
          <div className="flex items-center gap-2">
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
        <ShareForm week={week} onPostCreated={fetchPosts} />

        {/* Feed */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface border border-rim rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🌿</p>
            <p className="text-sm text-dim/60">Bu hafta henüz paylaşım yok.</p>
            <p className="text-xs text-dim/40 mt-1">İlk paylaşımı sen yap.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
