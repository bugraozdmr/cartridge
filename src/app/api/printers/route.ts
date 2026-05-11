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
      orderBy: [{ serialNumber: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        serialNumber: true,
        ipAddress: true,
        assignedTo: true,
        printerModel: { select: { name: true } },
      },
    })

    const results = printers.map((p: { 
      id: string, 
      serialNumber: string | null, 
      ipAddress: string | null, 
      assignedTo: string | null,
      printerModel: { name: string } | null
    }) => ({
      id: p.id,
      serialNumber: p.serialNumber,
      label: `${p.printerModel?.name || 'Yazıcı'}${p.serialNumber ? ` • ${p.serialNumber}` : p.ipAddress ? ` • ${p.ipAddress}` : p.assignedTo ? ` • ${p.assignedTo}` : ''}`,
    }))

    return NextResponse.json(results)
  } catch (err) {
    return NextResponse.json({ error: (err as any)?.message || 'Server error' }, { status: 500 })
  }
}
