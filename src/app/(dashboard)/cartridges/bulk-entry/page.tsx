import { getAllCompact } from "@/features/cartridges/repo"
import { BulkEntryForm } from "@/features/cartridges/components/BulkEntryForm"

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Toplu Giriş',
}

type CompactCartridge = {
  id: string
  name: string
  stock: number
  currentPrice: { toString(): string } | null
}

type SerializedCartridge = Omit<CompactCartridge, 'currentPrice'> & {
  currentPrice: string
}

export default async function BulkEntryPage() {
  const cartridges = (await getAllCompact()) as CompactCartridge[]

  const serializedCartridges: SerializedCartridge[] = cartridges.map((c) => ({
    ...c,
    currentPrice: c.currentPrice?.toString() || '0',
  }))

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <BulkEntryForm cartridges={serializedCartridges} />
    </div>
  )
}
