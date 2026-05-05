import prisma from '@/lib/prisma'

export async function getDepartmentById(id: string) {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: {
      stockOuts: {
        orderBy: { issueDate: 'desc' },
        include: {
          cartridge: {
            select: { id: true, name: true, imageUrl: true, currentPrice: true }
          }
        }
      }
    }
  })
  if (!dept) return null

  return {
    id: dept.id,
    name: dept.name,
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
    }))
  }
}
