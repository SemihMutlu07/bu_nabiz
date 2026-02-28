'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase'
import {
  collection, addDoc, getDocs, query, where, limit,
  writeBatch, doc, Timestamp,
} from 'firebase/firestore'
import { getCurrentWeek } from '@/lib/utils'

// ── Auth ──────────────────────────────────────────────────────
const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE ?? ''

function CodeGate({ onAuth }: { onAuth: () => void }) {
  const [input, setInput] = useState('')
  const [wrong, setWrong] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (ADMIN_CODE && input === ADMIN_CODE) {
      onAuth()
    } else {
      setWrong(true)
      setInput('')
    }
  }

  if (!ADMIN_CODE) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <p className="text-sm text-dim text-center">
          <code className="bg-surface border border-rim rounded px-1.5 py-0.5 text-xs">NEXT_PUBLIC_ADMIN_CODE</code> ortam değişkeni tanımlı değil.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        <p className="text-sm font-medium text-ink text-center">Admin kodu</p>
        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setWrong(false) }}
          autoFocus
          autoComplete="off"
          className="w-full text-sm bg-surface text-ink border border-rim rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
        />
        {wrong && <p className="text-xs text-dim text-center">Kod hatalı.</p>}
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl text-sm font-medium bg-ink text-bg hover:opacity-80 transition-all"
        >
          Giriş
        </button>
      </form>
    </div>
  )
}

// ── Seed data ─────────────────────────────────────────────────
type SeedPost = {
  category: 'ders' | 'proje' | 'basvuru' | 'hayat'
  status: 'yetismiyor' | 'odak_yok' | 'tikandim' | 'yorgun' | 'kaygili' | 'idare_eder'
  intensity: number
  custom_text: string | null
  micro_step: string | null
  me_too_count: number
}

const SAMPLE: SeedPost[] = [
  { category: 'ders',    status: 'yetismiyor', intensity: 4, custom_text: 'Üç dersin ödevi aynı güne denk geldi, hiçbirini yetiştiremeyeceğim.', micro_step: null,                                    me_too_count: 7 },
  { category: 'proje',   status: 'tikandim',   intensity: 3, custom_text: 'API entegrasyonunda bug var, 2 gündür çözememedim.',                  micro_step: "Stack Overflow'da sormayı dene.",       me_too_count: 4 },
  { category: 'basvuru', status: 'kaygili',    intensity: 5, custom_text: 'Staj başvurusunu gönderdim ama red gelirse ne yapacağımı bilmiyorum.', micro_step: null,                                    me_too_count: 12 },
  { category: 'hayat',   status: 'yorgun',     intensity: 3, custom_text: 'Bu hafta 5 gece yarısından sonra uyudum.',                             micro_step: 'Bu akşam telefonu kapat, erken yat.',   me_too_count: 9 },
  { category: 'ders',    status: 'odak_yok',   intensity: 2, custom_text: null,                                                                    micro_step: null,                                    me_too_count: 3 },
  { category: 'proje',   status: 'yetismiyor', intensity: 4, custom_text: 'Dönem projesi teslimi 3 gün kaldı, sadece %40\'ı bitirebildik.',       micro_step: null,                                    me_too_count: 5 },
  { category: 'hayat',   status: 'idare_eder', intensity: 2, custom_text: 'Kötü değil aslında, sadece biraz yorgunum.',                           micro_step: 'Bu akşam erken yat.',                   me_too_count: 1 },
  { category: 'ders',    status: 'tikandim',   intensity: 5, custom_text: 'Sayısal analiz finalinde 40 aldım, tekrar almam lazım.',               micro_step: null,                                    me_too_count: 6 },
  { category: 'basvuru', status: 'odak_yok',   intensity: 3, custom_text: null,                                                                    micro_step: null,                                    me_too_count: 0 },
  { category: 'proje',   status: 'kaygili',    intensity: 4, custom_text: 'Takım arkadaşları katkı sağlamıyor, her şeyi tek başıma yapıyorum.',   micro_step: null,                                    me_too_count: 8 },
  { category: 'ders',    status: 'yorgun',     intensity: 3, custom_text: 'Bu hafta 4 vize var, kafam çalışmıyor.',                               micro_step: 'Pomodoro: 25 dk çalış, 5 dk mola.',    me_too_count: 5 },
  { category: 'hayat',   status: 'yetismiyor', intensity: 4, custom_text: 'Ders + staj + sosyal hayat üçgenini bir türlü dengeleyemiyorum.',      micro_step: null,                                    me_too_count: 11 },
  { category: 'basvuru', status: 'idare_eder', intensity: 2, custom_text: 'CV\'yi güncelledim, birkaç yere gönderdim.',                           micro_step: null,                                    me_too_count: 0 },
  { category: 'ders',    status: 'kaygili',    intensity: 5, custom_text: null,                                                                    micro_step: null,                                    me_too_count: 4 },
  { category: 'proje',   status: 'yorgun',     intensity: 3, custom_text: 'Code review yorucu, aynı hatayı üçüncü kez düzeltiyorum.',             micro_step: null,                                    me_too_count: 3 },
  { category: 'hayat',   status: 'tikandim',   intensity: 4, custom_text: 'Burs başvurusu için gereken belgeleri bir türlü toplayamıyorum.',      micro_step: null,                                    me_too_count: 6 },
  { category: 'ders',    status: 'idare_eder', intensity: 1, custom_text: 'Bu hafta görece sakinmiş.',                                             micro_step: 'Okumak istediğin kitabı oku.',          me_too_count: 2 },
  { category: 'basvuru', status: 'yetismiyor', intensity: 5, custom_text: 'LinkedIn, Handshake, Glassdoor… hepsine ayrı CV hazırlamak gerekiyor.', micro_step: null,                                   me_too_count: 7 },
  { category: 'proje',   status: 'odak_yok',   intensity: 2, custom_text: null,                                                                    micro_step: null,                                    me_too_count: 1 },
  { category: 'hayat',   status: 'kaygili',    intensity: 3, custom_text: 'Mezuniyet sonrası ne yapacağımı bilmiyorum, herkes bir şey planlamış gibi görünüyor.', micro_step: null,                   me_too_count: 14 },
]

// ── Main component ────────────────────────────────────────────
type State = 'idle' | 'checking' | 'seeding' | 'seeded' | 'clearing' | 'cleared' | 'error'

export default function SeedClient() {
  const [authed, setAuthed] = useState(false)
  const [state, setState] = useState<State>('idle')
  const [msg, setMsg] = useState('')

  const week = getCurrentWeek()

  if (!authed) return <CodeGate onAuth={() => setAuthed(true)} />

  async function doInsert() {
    setState('seeding')
    const now = Date.now()
    for (let i = 0; i < SAMPLE.length; i++) {
      const p = SAMPLE[i]
      const ts = Timestamp.fromDate(new Date(now - (SAMPLE.length - i) * 1800_000))
      await addDoc(collection(db, 'posts'), { week, ...p, created_at: ts })
    }
    setState('seeded')
    setMsg(`${SAMPLE.length} post eklendi → /w/${week}`)
  }

  async function seed() {
    setMsg('')
    try {
      await doInsert()
    } catch (e) {
      console.error(e)
      setState('error')
      setMsg('Hata oluştu, konsolu kontrol et.')
    }
  }

  async function seedIfEmpty() {
    setState('checking')
    setMsg('')
    try {
      const snap = await getDocs(query(collection(db, 'posts'), where('week', '==', week), limit(1)))
      if (!snap.empty) {
        setState('idle')
        setMsg('Bu haftada zaten post var, seed atlanıyor.')
        return
      }
      await doInsert()
    } catch (e) {
      console.error(e)
      setState('error')
      setMsg('Hata oluştu, konsolu kontrol et.')
    }
  }

  async function clearWeek() {
    const ok = window.confirm(`${week} haftasındaki tüm postlar silinecek. Emin misin?`)
    if (!ok) return
    setState('clearing')
    setMsg('')
    try {
      const snap = await getDocs(query(collection(db, 'posts'), where('week', '==', week)))
      if (snap.empty) {
        setState('cleared')
        setMsg('Bu haftaya ait post yok.')
        return
      }
      const batch = writeBatch(db)
      snap.docs.forEach(d => batch.delete(doc(db, 'posts', d.id)))
      await batch.commit()
      setState('cleared')
      setMsg(`${snap.size} post silindi.`)
    } catch (e) {
      console.error(e)
      setState('error')
      setMsg('Silme hatası, konsolu kontrol et.')
    }
  }

  const busy = state === 'checking' || state === 'seeding' || state === 'clearing'

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-ink">Seed / Admin</h1>
          <p className="text-sm text-dim mt-1">Mevcut hafta: <code className="bg-surface border border-rim rounded px-1.5 py-0.5 text-xs">{week}</code></p>
        </div>

        <div className="bg-surface border border-rim rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-ink">Örnek veri ekle</p>
            <p className="text-xs text-dim mt-0.5">{SAMPLE.length} farklı post ekler (mevcut postlar silinmez).</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={seedIfEmpty}
              disabled={busy}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-ink text-bg hover:opacity-80 disabled:opacity-40 transition-all"
            >
              {state === 'checking' ? 'Kontrol ediliyor...' : state === 'seeding' ? 'Ekleniyor...' : 'Seed if empty'}
            </button>
            <button
              onClick={seed}
              disabled={busy}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-rim text-dim hover:text-ink hover:border-ink disabled:opacity-40 transition-all"
            >
              {state === 'seeding' ? 'Ekleniyor...' : `${SAMPLE.length} Post Ekle`}
            </button>
          </div>
        </div>

        <div className="bg-surface border border-rim rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-ink">Bu haftanın postlarını sil</p>
            <p className="text-xs text-dim mt-0.5">Yalnızca <code className="bg-rim/40 rounded px-1">{week}</code> haftasındaki postları siler.</p>
          </div>
          <button
            onClick={clearWeek}
            disabled={busy}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20 disabled:opacity-40 transition-all"
          >
            {state === 'clearing' ? 'Siliniyor...' : 'Bu haftanın postlarını sil'}
          </button>
        </div>

        {msg && (
          <p className={`text-sm px-4 py-3 rounded-xl border ${
            state === 'error'
              ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400'
              : 'bg-surface border-rim text-dim'
          }`}>
            {msg}
          </p>
        )}

        <details className="bg-surface border border-rim rounded-2xl">
          <summary className="px-5 py-3.5 text-sm font-medium text-ink cursor-pointer select-none">
            Firebase Console'dan silme talimatları
          </summary>
          <div className="px-5 pb-5 space-y-2 text-xs text-dim leading-relaxed">
            <p>1. <strong className="text-ink">Firebase Console</strong> → Firestore Database → <code className="bg-rim/40 rounded px-1">posts</code> koleksiyonu</p>
            <p>2. Tek tek silmek için: kaydın yanındaki ⋮ menüsü → <em>Delete document</em></p>
            <p>3. Tüm koleksiyonu silmek için: koleksiyon başlığına tıkla → ⋮ → <em>Delete collection</em> (geri alınamaz)</p>
            <p>4. <code className="bg-rim/40 rounded px-1">me_too_events</code> koleksiyonu için aynı adımları uygula.</p>
          </div>
        </details>
      </div>
    </div>
  )
}
