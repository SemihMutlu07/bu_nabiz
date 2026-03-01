import type { Category, Status } from './types'

export const CATEGORIES: Category[] = ['ders', 'proje', 'basvuru', 'hayat']
export const STATUSES: Status[] = ['yetismiyor', 'odak_yok', 'tikandim', 'yorgun', 'kaygili', 'idare_eder']

export const CATEGORY_LABELS: Record<Category, string> = {
  ders:    'Ders',
  proje:   'Proje',
  basvuru: 'Başvuru',
  hayat:   'Hayat',
}

export const STATUS_LABELS: Record<Status, string> = {
  yetismiyor: 'Yetişemiyorum',
  odak_yok:   'Odak Yok',
  tikandim:   'Tıkandım',
  yorgun:     'Yorgunum',
  kaygili:    'Kaygılıyım',
  idare_eder: 'Fena değil',
}

// Light + dark variants for category chips
export const CATEGORY_COLORS: Record<Category, string> = {
  ders:    'bg-blue-50   text-blue-700   dark:bg-blue-950/40   dark:text-blue-300',
  proje:   'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  basvuru: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  hayat:   'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
}

// Light + dark variants for status chips
export const STATUS_COLORS: Record<Status, string> = {
  yetismiyor: 'bg-red-50    text-red-700    dark:bg-red-950/40    dark:text-red-300',
  odak_yok:   'bg-amber-50  text-amber-700  dark:bg-amber-950/40  dark:text-amber-300',
  tikandim:   'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  yorgun:     'bg-zinc-100  text-zinc-600   dark:bg-zinc-800/60   dark:text-zinc-400',
  kaygili:    'bg-pink-50   text-pink-700   dark:bg-pink-950/40   dark:text-pink-300',
  idare_eder: 'bg-green-50  text-green-700  dark:bg-green-950/40  dark:text-green-300',
}
