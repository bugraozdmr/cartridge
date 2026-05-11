import prisma from '@/lib/prisma'

type PrinterRow = {
  id: string
  serialNumber: string | null
  assignedTo: string | null
  ipAddress: string | null
  notes: string | null
  departmentId: string
  printerModelId: string
  printerModel: { id: string; name: string } | null
  createdAt: Date
  updatedAt: Date
}

type StockOutRow = {
  id: string
  issueDate: Date
  quantity: number
  receiverName: string | null
  notes: string | null
  cartridge: { id: string; name: string; imageUrl: string | null; currentPrice: any }
  printer: { id: string; serialNumber: string | null } | null
}

export async function getDepartmentById(id: string) {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: {
      printers: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          serialNumber: true,
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
          printer: { select: { id: true, serialNumber: true } }
        }
      }
    }
  })
  if (!dept) return null

  return {
    id: dept.id,
    name: dept.name,
    printers: (dept.printers as PrinterRow[]).map((p: PrinterRow) => ({
      id: p.id,
      serialNumber: p.serialNumber || null,
      assignedTo: p.assignedTo || null,
      ipAddress: p.ipAddress || null,
      notes: p.notes || null,
      departmentId: p.departmentId,
      printerModelId: p.printerModelId,
      printerModelName: p.printerModel?.name || null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    stockOuts: (dept.stockOuts as StockOutRow[]).map((o: StockOutRow) => ({
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
      } : null
    }))
  }
}
