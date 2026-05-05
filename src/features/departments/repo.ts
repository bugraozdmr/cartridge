import prisma from '@/lib/prisma'

export async function getAll() {
  return prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { stockOuts: true } }
    }
  })
}

export async function create(name: string) {
  return prisma.department.create({ data: { name } })
}

export async function updateDepartment(id: string, name: string) {
  return prisma.department.update({ where: { id }, data: { name } })
}

export async function remove(id: string) {
  return prisma.department.delete({ where: { id } })
}

