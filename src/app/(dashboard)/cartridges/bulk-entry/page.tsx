import { getAllCompact } from "@/features/cartridges/repo"
import { BulkEntryForm } from "@/features/cartridges/components/BulkEntryForm"

export const dynamic = 'force-dynamic'

export default async function BulkEntryPage() {
  const cartridges = await getAllCompact()
  
  // Convert Decimals to numbers for the client component if needed, 
  // but Prisma already returns Decimal objects which we can .toString() in the repo.
  // The repo already does this in getAllCompact? Let's check.
  
  const serializedCartridges = cartridges.map(c => ({
    ...c,
    currentPrice: c.currentPrice?.toString() || '0'
  }))

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <BulkEntryForm cartridges={serializedCartridges} />
    </div>
  )
}
