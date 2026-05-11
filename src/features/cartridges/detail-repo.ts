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
      },
      stockOuts: {
        orderBy: { issueDate: 'desc' },
        include: {
          department: { select: { id: true, name: true } },
          printer: { select: { id: true, serialNumber: true } }
        }
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
    stockEntries: item.stockEntries.map((e: {
      id: string
      quantity: number
      unitPrice: any
      entryDate: Date
    }) => ({
      id: e.id,
      quantity: e.quantity,
      unitPrice: e.unitPrice ? e.unitPrice.toString() : null,
      entryDate: e.entryDate,
    })),
    stockOuts: item.stockOuts.map((o: {
      id: string
      quantity: number
      issueDate: Date
      department: { id: string; name: string }
      printer: { id: string; serialNumber: string | null } | null
      receiverName: string | null
      notes: string | null
    }) => ({
      id: o.id,
      quantity: o.quantity,
      issueDate: o.issueDate,
      department: o.department,
      printer: o.printer ? {
        id: o.printer.id,
        serialNumber: o.printer.serialNumber,
      } : null,
      receiverName: o.receiverName,
      notes: o.notes,
    })),
  }
}

export async function getAllDepartments() {
  return prisma.department.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })
}
