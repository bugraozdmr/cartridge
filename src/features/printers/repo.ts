import prisma from '@/lib/prisma'

export async function getAll() {
  const items = await prisma.printerModel.findMany({ include: { cartridges: true }, orderBy: { createdAt: 'desc' } })
  return items.map(item => ({
    id: item.id,
    name: item.name,
    imageUrl: item.imageUrl || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    cartridges: item.cartridges.map(c => ({
      id: c.id,
      name: c.name,
      stock: c.stock,
      imageUrl: c.imageUrl || null,
      currentPrice: c.currentPrice ? c.currentPrice.toString() : null
    }))
  }))
}

export async function getPage({ query, page = 1, pageSize = 20 }: { query?: string; page?: number; pageSize?: number }) {
  const skip = (page - 1) * pageSize

  const where = query ? { name: { contains: query, mode: 'insensitive' as const } } : {}

  const [items, total] = await Promise.all([
    prisma.printerModel.findMany({
      where,
      include: { cartridges: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.printerModel.count({ where })
  ])

  const itemsWithStrings = items.map(item => ({
    ...item,
    cartridges: item.cartridges.map(c => ({
      ...c,
      currentPrice: c.currentPrice ? c.currentPrice.toString() : null
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

export async function create(data: { name: string; imageUrl?: string }) {
  return prisma.printerModel.create({ data: { name: data.name, imageUrl: data.imageUrl || null } })
}

export async function remove(id: string) {
  return prisma.printerModel.delete({ where: { id } })
}

export async function update(id: string, data: { name?: string; imageUrl?: string | null }) {
  const payload: any = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl

  return prisma.printerModel.update({ where: { id }, data: payload })
}
