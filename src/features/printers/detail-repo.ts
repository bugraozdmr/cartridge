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
      ,
      printers: {
        select: {
          id: true,
          serialNumber: true,
          inventoryNumber: true,
          assignedTo: true,
          ipAddress: true,
          notes: true,
            printerModelId: true,
          departmentId: true,
          department: { select: { id: true, name: true } },
          createdAt: true,
          updatedAt: true,
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
    ,
    printers: item.printers?.map(p => ({
      id: p.id,
      serialNumber: p.serialNumber || null,
      inventoryNumber: p.inventoryNumber || null,
      assignedTo: p.assignedTo || null,
      ipAddress: p.ipAddress || null,
      notes: p.notes || null,
      printerModelId: p.printerModelId,
      departmentId: p.departmentId,
      departmentName: p.department?.name || null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })) || []
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
