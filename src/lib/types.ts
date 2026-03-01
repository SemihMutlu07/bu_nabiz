import type { Timestamp } from 'firebase/firestore'

export type Category = 'ders' | 'proje' | 'basvuru' | 'hayat'
export type Status = 'yetismiyor' | 'odak_yok' | 'tikandim' | 'yorgun' | 'kaygili' | 'idare_eder'

export interface Post {
  id: string
  week: string
  category: Category | null
  status: Status
  intensity: number
  custom_text?: string | null
  micro_step?: string | null
  me_too_count: number
  created_at: Timestamp | null
}
