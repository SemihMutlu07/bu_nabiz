'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'bu_nabiz_onboarded'

interface Props {
  onPrimary: () => void
}

export default function WelcomeSheet({ onPrimary }: Props) {
  const [shown,   setShown]   = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setShown(true)
        // double rAF so element is in DOM before transition starts
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setVisible(true))
        )
      }
    } catch { /* localStorage unavailable — skip */ }
  }, [])

  function dismiss() {
    setVisible(false)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
    setTimeout(() => setShown(false), 300)
  }

  function handlePrimary() {
    dismiss()
    onPrimary()
  }

  if (!shown) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' }}
        onClick={dismiss}
      />

      {/* Bottom sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        style={{
          transform:  visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div className="pointer-events-auto w-full max-w-2xl bg-surface border-t border-rim rounded-t-2xl px-5 pt-4 pb-10 sm:pb-6 space-y-4">

          {/* Drag handle */}
          <div className="w-8 h-1 bg-rim rounded-full mx-auto" />

          {/* Copy */}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-ink">
              Anonim, 20 saniyelik haftalık check-in.
            </p>
            <p className="text-sm text-dim leading-relaxed">
              Nasıl hissettiğini seç — diğer Boğaziçi öğrencileri de burada.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={dismiss}
              className="flex-1 min-h-[44px] rounded-xl text-sm text-dim hover:bg-rim/30 transition-colors"
            >
              Geç
            </button>
            <button
              onClick={handlePrimary}
              className="flex-[2] min-h-[44px] rounded-xl text-sm font-medium bg-ink text-bg hover:opacity-80 active:scale-[0.98] transition-all"
            >
              İlk check-in&apos;i yap
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
