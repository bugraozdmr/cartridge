import prisma from '@/lib/prisma'

type StockOutRow = {
  id: string
  issueDate: Date
  quantity: number
  receiverName: string | null
  notes: string | null
  cartridge: { id: string; name: string; imageUrl: string | null; currentPrice: any }
  department: { id: string; name: string }
}

type MovementRow = {
  id: string
  movedAt: Date
  fromDepartment: { id: string; name: string } | null
  toDepartment: { id: string; name: string }
  assignedTo: string | null
  notes: string | null
}

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
      },
      movements: {
        include: {
          fromDepartment: { select: { id: true, name: true } },
          toDepartment: { select: { id: true, name: true } }
        },
        orderBy: { movedAt: 'desc' }
      }
    }
  })

  if (!printer) return null

  return {
    id: printer.id,
    serialNumber: printer.serialNumber || null,
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
    stockOuts: (printer.stockOuts as StockOutRow[]).map((so: StockOutRow) => ({
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
    })),
    movements: (printer.movements as MovementRow[]).map((m: MovementRow) => ({
      id: m.id,
      movedAt: m.movedAt,
      fromDepartment: m.fromDepartment ? {
        id: m.fromDepartment.id,
        name: m.fromDepartment.name
      } : null,
      toDepartment: {
        id: m.toDepartment.id,
        name: m.toDepartment.name
      },
      assignedTo: m.assignedTo || null,
      notes: m.notes || null
    }))
  }
}
