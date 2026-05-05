import prisma from '@/lib/prisma'

export async function getById(id: string) {
  const item = await prisma.printerModel.findUnique({
    where: { id },
    include: {
      cartridges: {
        select: {
          id: true,
          name: true,
          stock: true,
          imageUrl: true,
          currentPrice: true,
        }
      }
    }
  })
  if (!item) return null
  return {
    ...item,
    cartridges: item.cartridges.map(c => ({
      ...c,
      currentPrice: c.currentPrice ? c.currentPrice.toString() : null
    }))
  }
}

export async function searchCartridges(query: string, excludeIds: string[] = []) {
  const items = await prisma.cartridge.findMany({
    where: {
      name: { contains: query },
      id: excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
    },
    select: { id: true, name: true, imageUrl: true },
    take: 8,
    orderBy: { name: 'asc' },
  })
  return items
}

export async function updateCompatibleCartridges(printerId: string, cartridgeIds: string[]) {
  // First disconnect all, then connect the selected ones
  await prisma.printerModel.update({
    where: { id: printerId },
    data: {
      cartridges: {
        set: cartridgeIds.map(id => ({ id })),
      }
    }
  })
}
