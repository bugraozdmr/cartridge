"use server"

import * as repo from './repo'
import { revalidatePath } from 'next/cache'
import { uploadImage } from '@/lib/cloudinary'

export async function addCartridge(formData: FormData) {
  try {
    const name = formData.get('name')?.toString()?.trim()
    const currentPrice = formData.get('currentPrice')?.toString()
    const stock = Number(formData.get('stock') || 0)
    if (!name) throw new Error('İsim alanı zorunludur.')

    let imageUrl: string | undefined = undefined

    const image = formData.get('image') as File | null
    if (image && image.size > 0) {
      console.log(`Uploading image for cartridge: ${name}, size: ${image.size} bytes`)
      imageUrl = (await uploadImage(image, 'cartridges')) ?? undefined
    }

    await repo.create({ name, currentPrice: currentPrice || undefined, stock, imageUrl })
    revalidatePath('/')
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Bu isimde bir toner zaten mevcut.')
    }
    throw error
  }
}

export async function deleteCartridge(formData: FormData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await repo.remove(id)
  revalidatePath('/')
  revalidatePath('/cartridges')
}

export async function updateCartridge(formData: FormData) {
  try {
    const id = formData.get('id')?.toString()
    if (!id) return

    const name = formData.get('name')?.toString()?.trim()
    const currentPrice = formData.get('currentPrice')?.toString()
    const stock = formData.get('stock') ? Number(formData.get('stock')) : undefined
    const removeImage = formData.get('removeImage') === 'true'

    let imageUrl: string | null | undefined = undefined

    if (removeImage) {
      imageUrl = null
    } else {
      const image = formData.get('image') as File | null
      if (image && image.size > 0) {
        console.log(`Updating image for cartridge: ${name}, size: ${image.size} bytes`)
        imageUrl = await uploadImage(image, 'cartridges')
      }
    }

    await repo.update(id, { name, currentPrice, stock, imageUrl })
    revalidatePath('/')
    revalidatePath('/cartridges')
    revalidatePath(`/cartridges/${id}`)
  } catch (error: any) {
    console.error('Cartridge action error:', error)
    if (error.code === 'P2002') {
      throw new Error('Bu isimde bir toner zaten mevcut.')
    }
    throw new Error(error.message || 'Bir hata oluştu.')
  }
}

export async function bulkAddStockAction(entries: { cartridgeId: string; quantity: number; unitPrice: string }[]) {
  try {
    await repo.bulkAddStock(entries)
    revalidatePath('/')
    revalidatePath('/cartridges')
    revalidatePath('/reports')
  } catch (error: any) {
    console.error('Bulk add stock action error:', error)
    throw new Error(error.message || 'Toplu stok girişi sırasında bir hata oluştu.')
  }
}
