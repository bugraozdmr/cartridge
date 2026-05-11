'use server'

import prisma from '@/lib/prisma'

// Arama sonuçları için bir tip tanımlayalım (Opsiyonel ama temiz kod için iyidir)
export async function globalSearch(query: string) {
  if (!query || query.length < 2) return null

  // Sonuçları alırken tipleri Prisma'nın kendi modellerinden alacak
  const [printerModels, physicalPrinters, cartridges, departments] = await Promise.all([
    prisma.printerModel.findMany({
      where: { name: { contains: query } },
      take: 5,
      select: { id: true, name: true }
    }),
    prisma.printer.findMany({
      where: {
        OR: [
          { serialNumber: { contains: query } },
          { assignedTo: { contains: query } },
          { ipAddress: { contains: query } }
        ]
      },
      take: 8,
      select: {
        id: true,
        serialNumber: true,
        assignedTo: true,
        ipAddress: true,
        printerModel: { select: { name: true } },
        department: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.cartridge.findMany({
      where: { name: { contains: query } },
      take: 5,
      select: { id: true, name: true, stock: true }
    }),
    prisma.department.findMany({
      where: { name: { contains: query } },
      take: 5,
      select: { id: true, name: true }
    })
  ])

  // Map fonksiyonlarında p, c, d değişkenlerine doğru tipler veriyoruz
  return {
    printerModels: printerModels.map((p: { id: string, name: string }) => ({ 
      id: p.id, 
      title: p.name, 
      type: 'Yazıcı Modeli', 
      href: `/printers/${p.id}` 
    })),
    physicalPrinters: physicalPrinters.map((p: {
      id: string
      serialNumber: string | null
      assignedTo: string | null
      ipAddress: string | null
      printerModel: { name: string }
      department: { name: string } | null
    }) => ({
      id: p.id,
      title: p.serialNumber || p.assignedTo || 'Fiziksel Yazıcı',
      meta: [p.department?.name, p.ipAddress ? `IP: ${p.ipAddress}` : null].filter(Boolean).join(' • ') || null,
      type: 'Fiziksel Yazıcı',
      href: `/printers/instances/${p.id}`
    })),
    cartridges: cartridges.map((c: { id: string, name: string, stock: number }) => ({ 
      id: c.id, 
      title: c.name, 
      type: 'Kartuş', 
      href: `/cartridges/${c.id}`, 
      meta: `Stok: ${c.stock}` 
    })),
    departments: departments.map((d: { id: string, name: string }) => ({ 
      id: d.id, 
      title: d.name, 
      type: 'Departman', 
      href: `/departments/${d.id}` 
    }))
  }
}