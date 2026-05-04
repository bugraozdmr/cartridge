import prisma from '@/lib/prisma'

export async function getById(id: string) {
  const item = await prisma.cartridge.findUnique({
    where: { id },
    include: {
      printerModels: {
        select: { id: true, name: true, imageUrl: true }
      },
      stockEntries: {
        orderBy: { entryDate: 'desc' },
        take: 10,
      }
    }
  })
  if (!item) return null
  return {
    id: item.id,
    name: item.name,
    stock: item.stock,
    imageUrl: item.imageUrl,
    currentPrice: item.currentPrice ? item.currentPrice.toString() : null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    printerModels: item.printerModels,
    stockEntries: item.stockEntries.map(e => ({
      id: e.id,
      quantity: e.quantity,
      unitPrice: e.unitPrice ? e.unitPrice.toString() : null,
      entryDate: e.entryDate,
    }))
  }
}
