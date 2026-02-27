import WeekFeed from './WeekFeed'

interface Props {
  params: Promise<{ week: string }>
}

export default async function WeekPage({ params }: Props) {
  const { week } = await params
  return <WeekFeed week={week} />
}
