import prisma from '@/lib/prisma'

export async function getAll() {
  const items = await prisma.cartridge.findMany({ include: { printerModels: true, stockEntries: true }, orderBy: { createdAt: 'desc' } })
  return items.map(item => ({
    id: item.id,
    name: item.name,
    stock: item.stock,
    imageUrl: item.imageUrl || null,
    currentPrice: item.currentPrice ? item.currentPrice.toString() : null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    stockEntries: item.stockEntries.map(entry => ({
      id: entry.id,
      quantity: entry.quantity,
      unitPrice: entry.unitPrice ? entry.unitPrice.toString() : null,
      entryDate: entry.entryDate
    }))
  }))
}

export async function getPage({ query, page = 1, pageSize = 20 }: { query?: string; page?: number; pageSize?: number }) {
  const skip = (page - 1) * pageSize

  const where = query ? { name: { contains: query } } : {}

  const [items, total] = await Promise.all([
    prisma.cartridge.findMany({
      where,
      include: { printerModels: true, stockEntries: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.cartridge.count({ where })
  ])

  const itemsWithStrings = items.map(item => ({
    id: item.id,
    name: item.name,
    stock: item.stock,
    imageUrl: item.imageUrl || null,
    currentPrice: item.currentPrice ? item.currentPrice.toString() : null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    stockEntries: item.stockEntries.map(entry => ({
      id: entry.id,
      quantity: entry.quantity,
      unitPrice: entry.unitPrice ? entry.unitPrice.toString() : null,
      entryDate: entry.entryDate
    }))
  }))

  return {
    items: itemsWithStrings,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

export async function create(data: { name: string; currentPrice?: string; stock?: number; imageUrl?: string }) {
  // const payload: any = { name: data.name, stock: data.stock || 0, imageUrl: data.imageUrl || null }

  const payload = { 
    name: data.name, 
    stock: data.stock || 0, 
    imageUrl: data.imageUrl || null,
    currentPrice: data.currentPrice || "0" 
  }

  if (data.currentPrice !== undefined) payload.currentPrice = data.currentPrice

  return prisma.cartridge.create({ data: payload })
}

export async function remove(id: string) {
  return prisma.cartridge.delete({ where: { id } })
}

export async function update(id: string, data: { name?: string; currentPrice?: string; stock?: number; imageUrl?: string | null }) {
  const payload: any = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.stock !== undefined) payload.stock = data.stock
  if (data.currentPrice !== undefined) payload.currentPrice = data.currentPrice
  if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl

  return prisma.cartridge.update({ where: { id }, data: payload })
}

export async function getAllCompact() {
  return prisma.cartridge.findMany({
    select: { id: true, name: true, stock: true, currentPrice: true },
    orderBy: { name: 'asc' }
  })
}

export async function bulkAddStock(entries: { cartridgeId: string; quantity: number; unitPrice: string }[]) {
  return prisma.$transaction(async (tx) => {
    for (const entry of entries) {
      if (entry.quantity <= 0) continue

      // Create stock entry
      await tx.stockEntry.create({
        data: {
          cartridgeId: entry.cartridgeId,
          quantity: entry.quantity,
          unitPrice: entry.unitPrice,
        }
      })

      // Update cartridge stock and currentPrice
      await tx.cartridge.update({
        where: { id: entry.cartridgeId },
        data: {
          stock: { increment: entry.quantity },
          currentPrice: entry.unitPrice
        }
      })
    }
  })
}
