'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function recalculateStock(cartridgeId: string) {
  const cartridge = await prisma.cartridge.findUnique({ where: { id: cartridgeId }, select: { stock: true } })
  if (!cartridge) return

  await prisma.cartridge.update({
    where: { id: cartridgeId },
    data: { stock: Math.max(0, cartridge.stock) },
  })
}

export async function addStockEntry(formData: FormData) {
  const cartridgeId = formData.get('cartridgeId')?.toString()
  if (!cartridgeId) throw new Error('Toner ID eksik.')

  const quantity = Number(formData.get('quantity'))
  const unitPrice = formData.get('unitPrice')?.toString()
  const entryDateRaw = formData.get('entryDate')?.toString()

  if (!quantity || quantity <= 0) throw new Error('Geçerli bir adet giriniz.')
  if (!unitPrice) throw new Error('Birim fiyat gereklidir.')
  if (!entryDateRaw) throw new Error('Tarih seçilmesi zorunludur.')

  // If the selected entry date is today, merge with current time so that
  // timestamps reflect the actual moment (avoids midnight-only dates that
  // can make manual edits appear newer than same-day entries).
  const now = new Date()
  let entryDate = new Date(entryDateRaw)
  if (entryDate.toDateString() === now.toDateString()) {
    entryDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
  }

  await prisma.$transaction([
    prisma.stockEntry.create({
      data: {
        cartridgeId,
        quantity,
        unitPrice: parseFloat(unitPrice),
        entryDate,
      }
    }),
    prisma.cartridge.update({
      where: { id: cartridgeId },
      data: { stock: { increment: quantity } },
    }),
  ])
  revalidatePath(`/cartridges/${cartridgeId}`)
}

export async function deleteStockEntry(formData: FormData) {
  const id = formData.get('id')?.toString()
  const cartridgeId = formData.get('cartridgeId')?.toString()
  if (!id || !cartridgeId) throw new Error('Eksik parametre.')

  const entry = await prisma.stockEntry.findUnique({ where: { id }, select: { quantity: true } })
  if (!entry) throw new Error('Stok girişi bulunamadı.')

  await prisma.$transaction([
    prisma.stockEntry.delete({ where: { id } }),
    prisma.cartridge.update({
      where: { id: cartridgeId },
      data: { stock: { decrement: entry.quantity } },
    }),
  ])
  revalidatePath(`/cartridges/${cartridgeId}`)
}

export async function addStockOut(formData: FormData) {
  const cartridgeId = formData.get('cartridgeId')?.toString()
  if (!cartridgeId) throw new Error('Toner ID eksik.')

  const quantity = Number(formData.get('quantity'))
  const departmentId = formData.get('departmentId')?.toString()
  const printerId = formData.get('printerId')?.toString() || null
  const receiverName = formData.get('receiverName')?.toString()?.trim() || null
  const notes = formData.get('notes')?.toString()?.trim() || null
  const issueDateRaw = formData.get('issueDate')?.toString()

  if (!quantity || quantity <= 0) throw new Error('Geçerli bir adet giriniz.')
  if (!departmentId) throw new Error('Departman seçilmesi zorunludur.')
  if (!issueDateRaw) throw new Error('Tarih seçilmesi zorunludur.')

  // Check stock availability
  const cartridge = await prisma.cartridge.findUnique({ where: { id: cartridgeId }, select: { stock: true } })
  if (!cartridge) throw new Error('Toner bulunamadı.')
  if (cartridge.stock < quantity) throw new Error(`Yetersiz stok. Mevcut: ${cartridge.stock} adet.`)

  const now = new Date()
  const issueDate = (() => {
    const d = new Date(issueDateRaw)
    if (d.toDateString() === now.toDateString()) {
      d.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
    }
    return d
  })()

  await prisma.$transaction([
    prisma.stockOut.create({
      data: {
        cartridgeId,
        departmentId,
        quantity,
        receiverName,
        notes,
        issueDate,
        ...(printerId ? { printerId } : {}),
      }
    }),
    prisma.cartridge.update({
      where: { id: cartridgeId },
      data: { stock: { decrement: quantity } },
    }),
  ])
  revalidatePath(`/cartridges/${cartridgeId}`)
}

export async function deleteStockOut(formData: FormData) {
  const id = formData.get('id')?.toString()
  const cartridgeId = formData.get('cartridgeId')?.toString()
  if (!id || !cartridgeId) throw new Error('Eksik parametre.')

  const outRecord = await prisma.stockOut.findUnique({ where: { id }, select: { quantity: true } })
  if (!outRecord) throw new Error('Stok çıkış kaydı bulunamadı.')

  await prisma.$transaction([
    prisma.stockOut.delete({ where: { id } }),
    prisma.cartridge.update({ where: { id: cartridgeId }, data: { stock: { increment: outRecord.quantity } } }),
  ])

  revalidatePath(`/cartridges/${cartridgeId}`)
}
