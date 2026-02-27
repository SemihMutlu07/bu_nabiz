'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    setMounted(true)
  }, [])

  function toggle() {
    const next = isDark ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('bu_nabiz_theme', next) } catch (_) {}
    setIsDark(!isDark)
  }

  // Reserve space to avoid layout shift before mount
  if (!mounted) return <div className="w-10 h-10" />

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      className="w-10 h-10 flex items-center justify-center rounded-xl text-dim hover:text-ink hover:bg-rim/50 transition-colors"
    >
      {isDark ? (
        /* Sun */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2"     x2="12" y2="4"    />
          <line x1="12" y1="20"    x2="12" y2="22"   />
          <line x1="2"  y1="12"    x2="4"  y2="12"   />
          <line x1="20" y1="12"    x2="22" y2="12"   />
          <line x1="4.93"  y1="4.93"  x2="6.34"  y2="6.34"  />
          <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
          <line x1="4.93"  y1="19.07" x2="6.34"  y2="17.66" />
          <line x1="17.66" y1="6.34"  x2="19.07" y2="4.93"  />
        </svg>
      ) : (
        /* Moon */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
