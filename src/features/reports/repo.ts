import prisma from '@/lib/prisma'
import { startOfDay, endOfDay, subDays } from 'date-fns'

export interface ReportFilters {
  start?: Date
  end?: Date
}

export async function getReportsData(filters: ReportFilters) {
  const start = filters.start || startOfDay(subDays(new Date(), 30))
  const end = filters.end || endOfDay(new Date())

  const [stockEntries, stockOuts, cartridges] = await Promise.all([
    prisma.stockEntry.findMany({
      where: {
        entryDate: { gte: start, lte: end }
      },
      include: {
        cartridge: { select: { name: true, imageUrl: true } }
      },
      orderBy: { entryDate: 'desc' }
    }),
    prisma.stockOut.findMany({
      where: {
        issueDate: { gte: start, lte: end }
      },
      include: {
        cartridge: { select: { name: true, currentPrice: true } },
        department: { select: { name: true } }
      },
      orderBy: { issueDate: 'desc' }
    }),
    prisma.cartridge.findMany({
      select: {
        id: true,
        name: true,
        currentPrice: true,
        stock: true,
        _count: {
          select: { stockOuts: true, stockEntries: true }
        }
      }
    })
  ])

  // Summary Calculations
  const totalSpend = stockEntries.reduce((acc, curr) => acc + (Number(curr.unitPrice) * curr.quantity), 0)
  const totalUnitsPurchased = stockEntries.reduce((acc, curr) => acc + curr.quantity, 0)
  const totalUnitsIssued = stockOuts.reduce((acc, curr) => acc + curr.quantity, 0)
  const estimatedConsumptionValue = stockOuts.reduce((acc, curr) => acc + (Number(curr.cartridge.currentPrice) * curr.quantity), 0)

  // Grouped Data for Charts/Tables
  // 1. Spend by Cartridge
  const spendByCartridge = stockEntries.reduce((acc, curr) => {
    const name = curr.cartridge.name
    if (!acc[name]) acc[name] = { name, total: 0, quantity: 0 }
    acc[name].total += (Number(curr.unitPrice) * curr.quantity)
    acc[name].quantity += curr.quantity
    return acc
  }, {} as Record<string, { name: string, total: number, quantity: number }>)

  // 2. Consumption by Department
  const consumptionByDept = stockOuts.reduce((acc, curr) => {
    const name = curr.department.name
    if (!acc[name]) acc[name] = { name, totalValue: 0, quantity: 0 }
    acc[name].totalValue += (Number(curr.cartridge.currentPrice) * curr.quantity)
    acc[name].quantity += curr.quantity
    return acc
  }, {} as Record<string, { name: string, totalValue: number, quantity: number }>)

  return {
    summary: {
      totalSpend,
      totalUnitsPurchased,
      totalUnitsIssued,
      estimatedConsumptionValue
    },
    stockEntries: stockEntries.map(e => ({
      id: e.id,
      date: e.entryDate,
      name: e.cartridge.name,
      imageUrl: e.cartridge.imageUrl,
      quantity: e.quantity,
      unitPrice: Number(e.unitPrice),
      total: Number(e.unitPrice) * e.quantity
    })),
    stockOuts: stockOuts.map(o => ({
      id: o.id,
      date: o.issueDate,
      cartridgeName: o.cartridge.name,
      departmentName: o.department.name,
      quantity: o.quantity,
      currentUnitPrice: Number(o.cartridge.currentPrice),
      totalValue: Number(o.cartridge.currentPrice) * o.quantity
    })),
    analytics: {
      spendByCartridge: Object.values(spendByCartridge).sort((a, b) => b.total - a.total),
      consumptionByDept: Object.values(consumptionByDept).sort((a, b) => b.totalValue - a.totalValue)
    }
  }
}
