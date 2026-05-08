'use server'

import prisma from '@/lib/prisma'

export async function globalSearch(query: string) {
  if (!query || query.length < 2) return null

  const [printerModels, physicalPrinters, cartridges, departments] = await Promise.all([
    prisma.printerModel.findMany({
      where: {
        name: { contains: query }
      },
      take: 5,
      select: { id: true, name: true }
    }),
    prisma.printer.findMany({
      where: {
        OR: [
          { serialNumber: { contains: query } },
          { inventoryNumber: { contains: query } },
          { assignedTo: { contains: query } },
          { ipAddress: { contains: query } }
        ]
      },
      take: 8,
      select: {
        id: true,
        serialNumber: true,
        inventoryNumber: true,
        assignedTo: true,
        printerModel: { select: { name: true } },
        department: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.cartridge.findMany({
      where: {
        name: { contains: query }
      },
      take: 5,
      select: { id: true, name: true, stock: true }
    }),
    prisma.department.findMany({
      where: {
        name: { contains: query }
      },
      take: 5,
      select: { id: true, name: true }
    })
  ])

  return {
    printerModels: printerModels.map(p => ({ id: p.id, title: p.name, type: 'Yazıcı Modeli', href: `/printers/${p.id}` })),
    physicalPrinters: physicalPrinters.map(p => ({
      id: p.id,
      title: p.serialNumber || p.inventoryNumber || p.assignedTo || 'Fiziksel Yazıcı',
      meta: [p.inventoryNumber, p.department?.name].filter(Boolean).join(' • ') || null,
      type: 'Fiziksel Yazıcı',
      href: `/printers/instances/${p.id}`
    })),
    cartridges: cartridges.map(c => ({ id: c.id, title: c.name, type: 'Kartuş', href: `/cartridges/${c.id}`, meta: `Stok: ${c.stock}` })),
    departments: departments.map(d => ({ id: d.id, title: d.name, type: 'Departman', href: `/departments/${d.id}` }))
  }
}
