import { redirect } from 'next/navigation'
import { getCurrentWeek } from '@/lib/utils'

export default function Home() {
  redirect(`/w/${getCurrentWeek()}`)
}
