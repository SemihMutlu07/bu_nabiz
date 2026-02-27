import PulseStats from './PulseStats'

interface Props {
  params: Promise<{ week: string }>
}

export default async function PulsePage({ params }: Props) {
  const { week } = await params
  return <PulseStats week={week} />
}
