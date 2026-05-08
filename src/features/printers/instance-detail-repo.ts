import prisma from '@/lib/prisma'

export async function getInstanceById(id: string) {
  const printer = await prisma.printer.findUnique({
    where: { id },
    include: {
      printerModel: { select: { id: true, name: true, imageUrl: true } },
      department: { select: { id: true, name: true } },
      stockOuts: {
        include: {
          cartridge: { select: { id: true, name: true, imageUrl: true, currentPrice: true } },
          department: { select: { id: true, name: true } }
        },
        orderBy: { issueDate: 'desc' }
      }
    }
  })

  if (!printer) return null

  return {
    id: printer.id,
    serialNumber: printer.serialNumber || null,
    inventoryNumber: printer.inventoryNumber || null,
    assignedTo: printer.assignedTo || null,
    ipAddress: printer.ipAddress || null,
    notes: printer.notes || null,
    createdAt: printer.createdAt,
    updatedAt: printer.updatedAt,
    printerModel: {
      id: printer.printerModel.id,
      name: printer.printerModel.name,
      imageUrl: printer.printerModel.imageUrl
    },
    department: printer.department ? {
      id: printer.department.id,
      name: printer.department.name
    } : null,
    stockOuts: printer.stockOuts.map(so => ({
      id: so.id,
      issueDate: so.issueDate,
      quantity: so.quantity,
      receiverName: so.receiverName || null,
      notes: so.notes || null,
      cartridge: {
        id: so.cartridge.id,
        name: so.cartridge.name,
        imageUrl: so.cartridge.imageUrl,
        currentPrice: so.cartridge.currentPrice ? so.cartridge.currentPrice.toString() : null
      },
      department: {
        id: so.department.id,
        name: so.department.name
      }
    }))
  }
}
