import prisma from '@/lib/prisma'
import { startOfDay, endOfDay, subDays } from 'date-fns'

export interface ReportFilters {
  start?: Date
  end?: Date
}

type StockEntryRow = {
  id: string
  entryDate: Date
  quantity: number
  unitPrice: any
  cartridge: { id: string; name: string; imageUrl: string | null }
}

type StockOutRow = {
  id: string
  issueDate: Date
  quantity: number
  departmentId: string
  cartridge: { id: string; name: string; currentPrice: any }
  department: { id: string; name: string }
  printer: { id: string; serialNumber: string | null } | null
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
        cartridge: { select: { id: true, name: true, imageUrl: true } }
      },
      orderBy: { entryDate: 'desc' }
    }),
    prisma.stockOut.findMany({
      where: {
        issueDate: { gte: start, lte: end }
      },
      include: {
        cartridge: { select: { id: true, name: true, currentPrice: true } },
        department: { select: { id: true, name: true } },
        printer: { select: { id: true, serialNumber: true } }
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
  const typedStockEntries = stockEntries as StockEntryRow[]
  const typedStockOuts = stockOuts as StockOutRow[]
  
  const totalSpend = typedStockEntries.reduce((acc: number, curr: StockEntryRow) => acc + (Number(curr.unitPrice) * curr.quantity), 0)
  const totalUnitsPurchased = typedStockEntries.reduce((acc: number, curr: StockEntryRow) => acc + curr.quantity, 0)
  const totalUnitsIssued = typedStockOuts.reduce((acc: number, curr: StockOutRow) => acc + curr.quantity, 0)
  const estimatedConsumptionValue = typedStockOuts.reduce((acc: number, curr: StockOutRow) => acc + (Number(curr.cartridge.currentPrice) * curr.quantity), 0)

  // Grouped Data for Charts/Tables
  // 1. Spend by Cartridge
  const spendByCartridge = typedStockEntries.reduce((acc: Record<string, { id: string, name: string, total: number, quantity: number }>, curr: StockEntryRow) => {
    const name = curr.cartridge.name
    const id = curr.cartridge.id
    if (!acc[name]) acc[name] = { id, name, total: 0, quantity: 0 }
    acc[name].total += (Number(curr.unitPrice) * curr.quantity)
    acc[name].quantity += curr.quantity
    return acc
  }, {} as Record<string, { id: string, name: string, total: number, quantity: number }>)

  // 2. Consumption by Department
  const consumptionByDept = typedStockOuts.reduce((acc: Record<string, { id: string, name: string, totalValue: number, quantity: number }>, curr: StockOutRow) => {
    const name = curr.department.name
    const id = curr.departmentId
    if (!acc[name]) acc[name] = { id, name, totalValue: 0, quantity: 0 }
    acc[name].totalValue += (Number(curr.cartridge.currentPrice) * curr.quantity)
    acc[name].quantity += curr.quantity
    return acc
  }, {} as Record<string, { id: string, name: string, totalValue: number, quantity: number }>)

  return {
    summary: {
      totalSpend,
      totalUnitsPurchased,
      totalUnitsIssued,
      estimatedConsumptionValue
    },
    stockEntries: typedStockEntries.map((e: StockEntryRow) => ({
      id: e.id,
      date: e.entryDate,
      name: e.cartridge.name,
      imageUrl: e.cartridge.imageUrl,
      quantity: e.quantity,
      unitPrice: Number(e.unitPrice),
      total: Number(e.unitPrice) * e.quantity
    })),
    stockOuts: typedStockOuts.map((o: StockOutRow) => ({
      id: o.id,
      date: o.issueDate,
      cartridgeName: o.cartridge.name,
      cartridgeId: o.cartridge.id,
      departmentName: o.department.name,
      departmentId: o.department.id,
      quantity: o.quantity,
      printerId: o.printer?.id ?? null,
      printerLabel: o.printer?.serialNumber || null,
      currentUnitPrice: Number(o.cartridge.currentPrice),
      totalValue: Number(o.cartridge.currentPrice) * o.quantity
    })),
    analytics: {
      spendByCartridge: Object.values(spendByCartridge).sort((a, b) => b.total - a.total),
      consumptionByDept: Object.values(consumptionByDept).sort((a, b) => b.quantity - a.quantity)
    }
  }
}
