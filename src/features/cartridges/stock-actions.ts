'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function recalculateStock(cartridgeId: string) {
  const [inAgg, outAgg] = await Promise.all([
    prisma.stockEntry.aggregate({ where: { cartridgeId }, _sum: { quantity: true } }),
    prisma.stockOut.aggregate({ where: { cartridgeId }, _sum: { quantity: true } }),
  ])
  const totalIn = inAgg._sum.quantity ?? 0
  const totalOut = outAgg._sum.quantity ?? 0
  await prisma.cartridge.update({
    where: { id: cartridgeId },
    data: { stock: Math.max(0, totalIn - totalOut) },
  })
}

export async function addStockEntry(formData: FormData) {
  const cartridgeId = formData.get('cartridgeId')?.toString()
  if (!cartridgeId) throw new Error('Kartuş ID eksik.')

  const quantity = Number(formData.get('quantity'))
  const unitPrice = formData.get('unitPrice')?.toString()
  const entryDateRaw = formData.get('entryDate')?.toString()

  if (!quantity || quantity <= 0) throw new Error('Geçerli bir adet giriniz.')
  if (!unitPrice) throw new Error('Birim fiyat gereklidir.')
  if (!entryDateRaw) throw new Error('Tarih seçilmesi zorunludur.')

  await prisma.stockEntry.create({
    data: {
      cartridgeId,
      quantity,
      unitPrice: parseFloat(unitPrice),
      entryDate: new Date(entryDateRaw),
    }
  })
  await recalculateStock(cartridgeId)
  revalidatePath(`/cartridges/${cartridgeId}`)
}

export async function deleteStockEntry(formData: FormData) {
  const id = formData.get('id')?.toString()
  const cartridgeId = formData.get('cartridgeId')?.toString()
  if (!id || !cartridgeId) throw new Error('Eksik parametre.')

  await prisma.stockEntry.delete({ where: { id } })
  await recalculateStock(cartridgeId)
  revalidatePath(`/cartridges/${cartridgeId}`)
}

export async function addStockOut(formData: FormData) {
  const cartridgeId = formData.get('cartridgeId')?.toString()
  if (!cartridgeId) throw new Error('Kartuş ID eksik.')

  const quantity = Number(formData.get('quantity'))
  const departmentId = formData.get('departmentId')?.toString()
  const receiverName = formData.get('receiverName')?.toString()?.trim() || null
  const notes = formData.get('notes')?.toString()?.trim() || null
  const issueDateRaw = formData.get('issueDate')?.toString()

  if (!quantity || quantity <= 0) throw new Error('Geçerli bir adet giriniz.')
  if (!departmentId) throw new Error('Departman seçilmesi zorunludur.')
  if (!issueDateRaw) throw new Error('Tarih seçilmesi zorunludur.')

  // Check stock availability
  const cartridge = await prisma.cartridge.findUnique({ where: { id: cartridgeId }, select: { stock: true } })
  if (!cartridge) throw new Error('Kartuş bulunamadı.')
  if (cartridge.stock < quantity) throw new Error(`Yetersiz stok. Mevcut: ${cartridge.stock} adet.`)

  await prisma.stockOut.create({
    data: {
      cartridgeId,
      departmentId,
      quantity,
      receiverName,
      notes,
      issueDate: new Date(issueDateRaw),
    }
  })
  await recalculateStock(cartridgeId)
  revalidatePath(`/cartridges/${cartridgeId}`)
}

export async function deleteStockOut(formData: FormData) {
  const id = formData.get('id')?.toString()
  const cartridgeId = formData.get('cartridgeId')?.toString()
  if (!id || !cartridgeId) throw new Error('Eksik parametre.')

  await prisma.stockOut.delete({ where: { id } })
  await recalculateStock(cartridgeId)
  revalidatePath(`/cartridges/${cartridgeId}`)
}
