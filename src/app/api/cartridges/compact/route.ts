'use server'

import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const items = await prisma.cartridge.findMany({ select: { id: true, name: true, stock: true }, orderBy: { name: 'asc' } })
    return NextResponse.json(items)
  } catch (err) {
    return NextResponse.json({ error: (err as any)?.message || 'Server error' }, { status: 500 })
  }
}
