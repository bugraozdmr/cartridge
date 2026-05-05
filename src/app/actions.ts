'use server'

import prisma from '@/lib/prisma'

export async function globalSearch(query: string) {
  if (!query || query.length < 2) return null

  const [printers, cartridges, departments] = await Promise.all([
    prisma.printerModel.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' }
      },
      take: 5,
      select: { id: true, name: true }
    }),
    prisma.cartridge.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' }
      },
      take: 5,
      select: { id: true, name: true, stock: true }
    }),
    prisma.department.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' }
      },
      take: 5,
      select: { id: true, name: true }
    })
  ])

  return {
    printers: printers.map(p => ({ id: p.id, title: p.name, type: 'Yazıcı', href: `/printers/${p.id}` })),
    cartridges: cartridges.map(c => ({ id: c.id, title: c.name, type: 'Kartuş', href: `/cartridges/${c.id}`, meta: `Stok: ${c.stock}` })),
    departments: departments.map(d => ({ id: d.id, title: d.name, type: 'Departman', href: `/departments/${d.id}` }))
  }
}
