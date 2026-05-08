'use server'

import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const departmentId = url.searchParams.get('departmentId')
    if (!departmentId) return NextResponse.json({ error: 'departmentId required' }, { status: 400 })

    const printers = await prisma.printer.findMany({
      where: { departmentId },
      orderBy: [{ serialNumber: 'asc' }, { inventoryNumber: 'asc' }],
      select: { id: true, serialNumber: true, inventoryNumber: true },
    })

    const results = printers.map(p => ({
      id: p.id,
      serialNumber: p.serialNumber,
      inventoryNumber: p.inventoryNumber,
      label: p.serialNumber || p.inventoryNumber || p.id,
    }))

    return NextResponse.json(results)
  } catch (err) {
    return NextResponse.json({ error: (err as any)?.message || 'Server error' }, { status: 500 })
  }
}
