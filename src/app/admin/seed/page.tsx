import SeedClient from './SeedClient'

interface Props {
  searchParams: Promise<{ secret?: string }>
}

const SECRET = 'bu-nabiz-seed'

export default async function SeedPage({ searchParams }: Props) {
  const { secret } = await searchParams

  if (secret !== SECRET) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-ink font-medium">401</p>
          <p className="text-sm text-dim">
            Erişmek için <code className="bg-surface border border-rim rounded px-1.5 py-0.5 text-xs">?secret=bu-nabiz-seed</code> ekle
          </p>
        </div>
      </div>
    )
  }

  return <SeedClient />
}
