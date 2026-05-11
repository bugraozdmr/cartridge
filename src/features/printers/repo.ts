import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

type PrinterModelWithCartridges = {
  id: string
  name: string
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
  cartridges: Array<{ id: string; name: string; stock: number; imageUrl: string | null; currentPrice: any }>
}

export async function getAll() {
  const items = await prisma.printerModel.findMany({ include: { cartridges: true }, orderBy: { createdAt: 'desc' } })
  return (items as PrinterModelWithCartridges[]).map((item: PrinterModelWithCartridges) => ({
    id: item.id,
    name: item.name,
    imageUrl: item.imageUrl || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    cartridges: item.cartridges.map((c) => ({
      id: c.id,
      name: c.name,
      stock: c.stock,
      imageUrl: c.imageUrl || null,
      currentPrice: c.currentPrice ? c.currentPrice.toString() : null
    }))
  }))
}

export async function getAllCompact() {
  return prisma.printerModel.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
}

export async function getPage({ query, page = 1, pageSize = 20 }: { query?: string; page?: number; pageSize?: number }) {
  const skip = (page - 1) * pageSize

  const where = query ? { name: { contains: query } } : {}

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

  const itemsWithStrings = (items as PrinterModelWithCartridges[]).map((item: PrinterModelWithCartridges) => ({
    ...item,
    cartridges: item.cartridges.map((c) => ({
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
  const payload: { name?: string; imageUrl?: string | null } = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl

  return prisma.printerModel.update({ where: { id }, data: payload })
}

export async function getPrintersByModelId(printerModelId: string) {
  const items = await prisma.printer.findMany({
    where: { printerModelId },
    include: { department: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  })

  type PrinterItem = {
    id: string
    serialNumber: string | null
    assignedTo: string | null
    ipAddress: string | null
    notes: string | null
    departmentId: string
    department: { id: string; name: string } | null
    createdAt: Date
    updatedAt: Date
  }

  return (items as PrinterItem[]).map((p: PrinterItem) => ({
    id: p.id,
    serialNumber: p.serialNumber || null,
    assignedTo: p.assignedTo || null,
    ipAddress: p.ipAddress || null,
    notes: p.notes || null,
    departmentId: p.departmentId,
    departmentName: p.department?.name || null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }))
}

export async function createPrinter(printerModelId: string, data: { serialNumber?: string; assignedTo?: string; ipAddress?: string; notes?: string; departmentId: string }) {
  try {
    return await prisma.$transaction(async (tx: any) => {
      const printer = await tx.printer.create({
        data: {
          serialNumber: data.serialNumber || undefined,
          assignedTo: data.assignedTo || undefined,
          ipAddress: data.ipAddress || undefined,
          notes: data.notes || undefined,
          printerModelId,
          departmentId: data.departmentId,
        }
      })

      // Create initial movement record
      await tx.printerMovement.create({
        data: {
          printerId: printer.id,
          toDepartmentId: data.departmentId,
          assignedTo: data.assignedTo || null,
          notes: 'Cihaz sisteme eklendi ve ilk departman ataması yapıldı.'
        }
      })

      return printer
    })
  } catch (error: any) {
    console.log('[PRINTER REPO] Error caught:', {
      code: error.code,
      message: error.message,
      constructor: error.constructor?.name,
      meta: error.meta,
      isP2002: error.code === 'P2002',
      hasSerializer: typeof error === 'object'
    })
    // Check if it's a Prisma unique constraint error
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes('serialNumber')
    ) {
      throw new Error('Bu seri no zaten tanımlı.')
    }
    throw error
  }
}

export async function updatePrinterInstance(id: string, data: { serialNumber?: string; assignedTo?: string; ipAddress?: string; notes?: string; departmentId: string; movementNotes?: string }) {
  try {
    return await prisma.$transaction(async (tx: any) => {
      // 1. Get current state to compare
      const current = await tx.printer.findUnique({
        where: { id },
        select: { departmentId: true, assignedTo: true }
      })

      // 2. Update the printer
      const updated = await tx.printer.update({
        where: { id },
        data: {
          serialNumber: data.serialNumber || null,
          assignedTo: data.assignedTo || null,
          ipAddress: data.ipAddress || null,
          notes: data.notes || null,
          departmentId: data.departmentId,
        }
      })

      // 3. If department or assignment changed, create movement record
      if (current && (current.departmentId !== data.departmentId || current.assignedTo !== data.assignedTo)) {
        await tx.printerMovement.create({
          data: {
            printerId: id,
            fromDepartmentId: current.departmentId,
            toDepartmentId: data.departmentId,
            assignedTo: data.assignedTo || null,
            notes: data.movementNotes || data.notes || 'Departman veya sorumlu değişikliği'
          }
        })
      }

      return updated
    })
  } catch (error: any) {
    // Check if it's a Prisma unique constraint error
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes('serialNumber')
    ) {
      throw new Error('Bu seri no zaten tanımlı.')
    }
    throw error
  }
}

export async function removePrinterInstance(id: string) {
  return prisma.printer.delete({ where: { id } })
}
