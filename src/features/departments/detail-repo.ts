import prisma from '@/lib/prisma'

export async function getDepartmentById(id: string) {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: {
      printers: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          serialNumber: true,
          inventoryNumber: true,
          assignedTo: true,
          ipAddress: true,
          notes: true,
          departmentId: true,
          printerModelId: true,
          printerModel: { select: { id: true, name: true } },
          createdAt: true,
          updatedAt: true,
        }
      },
      stockOuts: {
        orderBy: { issueDate: 'desc' },
        include: {
          cartridge: {
            select: { id: true, name: true, imageUrl: true, currentPrice: true }
          },
          printer: { select: { id: true, serialNumber: true, inventoryNumber: true } }
        }
      }
    }
  })
  if (!dept) return null

  return {
    id: dept.id,
    name: dept.name,
    printers: dept.printers.map(p => ({
      id: p.id,
      serialNumber: p.serialNumber || null,
      inventoryNumber: p.inventoryNumber || null,
      assignedTo: p.assignedTo || null,
      ipAddress: p.ipAddress || null,
      notes: p.notes || null,
      departmentId: p.departmentId,
      printerModelId: p.printerModelId,
      printerModelName: p.printerModel?.name || null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    stockOuts: dept.stockOuts.map(o => ({
      id: o.id,
      issueDate: o.issueDate,
      quantity: o.quantity,
      receiverName: o.receiverName,
      notes: o.notes,
      cartridge: {
        id: o.cartridge.id,
        name: o.cartridge.name,
        imageUrl: o.cartridge.imageUrl,
        currentPrice: o.cartridge.currentPrice?.toString() ?? null,
      }
      ,
      printer: o.printer ? {
        id: o.printer.id,
        serialNumber: o.printer.serialNumber || null,
        inventoryNumber: o.printer.inventoryNumber || null,
      } : null
    }))
  }
}
