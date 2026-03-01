// ── Types ─────────────────────────────────────────────────────
export type ValidationResult = { ok: true } | { ok: false; message: string }

// ── Custom-text rules ─────────────────────────────────────────

/** 5+ identical chars in a row: aaaaa, ....., !!!!!! */
const REPEATED_CHAR = /(.)\1{4,}/

/** No Turkish or Latin letter at all (pure punctuation / numbers / symbols) */
const ONLY_NONLETTER = /^[^a-zA-ZğüşıöçĞÜŞİÖÇ]+$/

/** Known keyboard-smash / filler patterns (compared against full trimmed, lowercased text) */
const SPAM_EXACT = new Set([
  'asd', 'asdf', 'asdfg', 'asdfgh',
  'qwe', 'qwer', 'qwerty',
  'zxc', 'zxcv', 'zxcvb',
  'abc', 'abcd', 'abcde',
  'test', 'deneme', 'lorem', 'lorem ipsum',
  'bla bla', 'blabla',
  'falan', 'falan filan',
  'aaaa', 'bbbb', 'cccc', 'dddd', 'eeee',
  'haha', 'hahaha', 'hehe', 'hehehehe',
])

/**
 * Profanity that is blocked as a substring (won't appear innocently in Turkish).
 */
const PROFANITY_SUBSTR = [
  'orospu', 'pezevenk', 'hassiktir', 'amcık', 'yarrak', 'götveren',
]

/**
 * Profanity blocked only as whole whitespace-separated tokens
 * (shorter roots that could theoretically occur inside other words).
 */
const PROFANITY_WORD = new Set([
  'amk', 'amq', 'oç', 'oq', 'piç', 'bok', 'sik', 'göt', 'kahpe', 'orospu',
])

export function validateCustomText(raw: string): ValidationResult {
  const text = raw.trim()

  // Empty is fine — field is optional
  if (text.length === 0) return { ok: true }

  if (text.length < 8) {
    return { ok: false, message: 'Biraz daha açıklar mısın? En az 8 karakter gerekli.' }
  }

  if (text.length > 160) {
    return { ok: false, message: 'Metin 160 karakteri aşıyor.' }
  }

  if (ONLY_NONLETTER.test(text)) {
    return { ok: false, message: 'Metin anlamlı görünmüyor, biraz daha açar mısın?' }
  }

  if (REPEATED_CHAR.test(text)) {
    return { ok: false, message: 'Metin anlamlı görünmüyor, biraz daha açar mısın?' }
  }

  const lower = text.toLowerCase()

  if (SPAM_EXACT.has(lower)) {
    return { ok: false, message: 'Metin anlamlı görünmüyor, biraz daha açar mısın?' }
  }

  // Low unique-character ratio → likely keyboard smash (e.g. "asdasdas")
  const stripped = lower.replace(/\s/g, '')
  if (stripped.length >= 10 && new Set(stripped.split('')).size / stripped.length < 0.3) {
    return { ok: false, message: 'Metin anlamlı görünmüyor, biraz daha açar mısın?' }
  }

  // Profanity — substring pass
  for (const s of PROFANITY_SUBSTR) {
    if (lower.includes(s)) {
      return { ok: false, message: 'Anonim ama saygılı kalıyoruz — bu ifadeyi değiştirir misin?' }
    }
  }

  // Profanity — whole-word pass
  const words = lower.split(/\s+/)
  for (const w of words) {
    if (PROFANITY_WORD.has(w)) {
      return { ok: false, message: 'Anonim ama saygılı kalıyoruz — bu ifadeyi değiştirir misin?' }
    }
  }

  return { ok: true }
}

// ── Post cooldown (30 s) ──────────────────────────────────────

const COOLDOWN_KEY = 'bu_nabiz_last_post'
const COOLDOWN_MS  = 30_000

export function checkCooldown(): ValidationResult {
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY)
    if (!raw) return { ok: true }
    const elapsed = Date.now() - parseInt(raw, 10)
    if (elapsed < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000)
      return {
        ok: false,
        message: `Az önce bir paylaşım yaptın. ${remaining} saniye sonra tekrar paylaşabilirsin.`,
      }
    }
  } catch {
    // localStorage unavailable — allow submission
  }
  return { ok: true }
}

export function recordPost(): void {
  try {
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString())
  } catch {
    // ignore
  }
}
