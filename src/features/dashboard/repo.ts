import prisma from '@/lib/prisma'
import { startOfMonth, subMonths, format, startOfDay, endOfDay, eachMonthOfInterval, isWithinInterval } from 'date-fns'

type StockEntryRow = { quantity: number; entryDate: Date; unitPrice: any }
type StockOutRow = { id: string; issueDate: Date; quantity: number; department: { name: string }; cartridge?: { name: string }; printer?: { id: string; serialNumber: string | null } }
type RecentStockOut = { id: string; issueDate: Date; quantity: number; department: { name: string }; cartridge: { name: string }; printer: { id: string; serialNumber: string | null } | null }

export async function getDashboardData(startDate?: Date, endDate?: Date) {
  const now = new Date()
  const effectiveEnd = endDate || endOfDay(now)
  const effectiveStart = startDate || startOfDay(subMonths(now, 5))

  const [
    printerCount,
    criticalCount,
    departmentCount,
    recentStockOuts,
    totalCartridges,
    lowStockCartridges,
    allStockEntries,
    allStockOuts,
  ] = await Promise.all([
    prisma.printerModel.count(),
    prisma.cartridge.count({ where: { stock: { gt: 0, lt: 5 } } }),
    prisma.department.count(),
    prisma.stockOut.findMany({
      take: 7,
      orderBy: { issueDate: 'desc' },
      include: {
        department: { select: { name: true } },
        cartridge: { select: { name: true } },
        printer: { select: { id: true, serialNumber: true } },
      },
    }),
    prisma.cartridge.count(),
    prisma.cartridge.findMany({
      where: { stock: { gt: 0, lt: 5 } },
      take: 5,
      orderBy: { stock: 'asc' },
      select: { id: true, name: true, stock: true, imageUrl: true }
    }),
    // Fetch all for the range to calculate stats in memory or use grouped queries
    prisma.stockEntry.findMany({
      where: {
        entryDate: {
          gte: effectiveStart,
          lte: effectiveEnd,
        },
      },
      select: { quantity: true, entryDate: true, unitPrice: true }
    }),
    prisma.stockOut.findMany({
      where: {
        issueDate: {
          gte: effectiveStart,
          lte: effectiveEnd,
        },
      },
      include: {
        department: { select: { name: true } }
      }
    })
  ])

  // Generate monthly buckets for charts
  const months = eachMonthOfInterval({
    start: effectiveStart,
    end: effectiveEnd,
  })

  const typedStockEntries = allStockEntries as StockEntryRow[]
  const typedStockOuts = allStockOuts as StockOutRow[]

  const monthlyStockIn = months.map(m => {
    const start = startOfMonth(m)
    const end = endOfDay(new Date(m.getFullYear(), m.getMonth() + 1, 0))
    
    // Calculate total monetary value (Price * Quantity)
    const totalVolume = typedStockEntries
      .filter((e: StockEntryRow) => isWithinInterval(e.entryDate, { start, end }))
      .reduce((acc: number, curr: StockEntryRow) => acc + (curr.quantity * Number(curr.unitPrice)), 0)

    return {
      name: format(m, 'MMM'),
      total: totalVolume,
    }
  })

  const monthlyStockOut = months.map(m => {
    const start = startOfMonth(m)
    const end = endOfDay(new Date(m.getFullYear(), m.getMonth() + 1, 0))
    
    const total = typedStockOuts
      .filter((e: StockOutRow) => isWithinInterval(e.issueDate, { start, end }))
      .reduce((acc: number, curr: StockOutRow) => acc + curr.quantity, 0)

    return {
      name: format(m, 'MMM'),
      total,
    }
  })

  // Department distribution for the selected range
  const deptMap: Record<string, number> = {}
  typedStockOuts.forEach((o: StockOutRow) => {
    deptMap[o.department.name] = (deptMap[o.department.name] || 0) + o.quantity
  })

  const distribution = Object.entries(deptMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  const grandTotal = distribution.reduce((acc, curr) => acc + curr.total, 0)

  return {
    metrics: {
      printerCount,
      criticalCount,
      departmentCount,
      totalCartridges,
    },
    recentActivities: (recentStockOuts as RecentStockOut[]).map((s: RecentStockOut) => ({
      id: s.id,
      title: `${s.department.name} - ${s.cartridge.name}`,
      meta: `${s.quantity} adet • ${format(s.issueDate, 'dd MMM HH:mm')}`,
      printerId: s.printer ? s.printer.id : null,
      printerLabel: s.printer ? (s.printer.serialNumber || null) : null,
    })),
    monthlyStockIn,
    monthlyStockOut,
    lowStockCartridges,
    distribution: distribution.map(d => ({
      ...d,
      percent: grandTotal > 0 ? Math.round((d.total / grandTotal) * 100) : 0
    }))
  }
}
