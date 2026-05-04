"use server"

import * as repo from './repo'
import { revalidatePath } from 'next/cache'
import { uploadImage } from '@/lib/cloudinary'

export async function addPrinter(formData: FormData) {
  try {
    const name = formData.get('name')?.toString()?.trim()
    if (!name) throw new Error('İsim alanı zorunludur.')

    let imageUrl: string | undefined = undefined

    const image = formData.get('image') as File | null
    if (image && image.size > 0) {
      console.log(`Uploading image for printer: ${name}, size: ${image.size} bytes`)
      imageUrl = (await uploadImage(image, 'printers')) ?? undefined
    }

    await repo.create({ name, imageUrl })
    revalidatePath('/')
  } catch (error: any) {
    console.error('Printer action error:', error)
    if (error.code === 'P2002') {
      throw new Error('Bu isimde bir yazıcı zaten mevcut.')
    }
    throw new Error(error.message || 'Bir hata oluştu.')
  }
}

export async function deletePrinter(formData: FormData) {
  const id = formData.get('id')?.toString()
  if (!id) return

  await repo.remove(id)
  revalidatePath('/')
}

export async function updatePrinter(formData: FormData) {
  try {
    const id = formData.get('id')?.toString()
    if (!id) return

    const name = formData.get('name')?.toString()?.trim()
    const removeImage = formData.get('removeImage') === 'true'

    let imageUrl: string | null | undefined = undefined

    if (removeImage) {
      imageUrl = null
    } else {
      const image = formData.get('image') as File | null
      if (image && image.size > 0) {
        console.log(`Updating image for printer: ${name}, size: ${image.size} bytes`)
        imageUrl = await uploadImage(image, 'printers')
      }
    }

    await repo.update(id, { name, imageUrl })
    revalidatePath('/')
  } catch (error: any) {
    console.error('Printer update error:', error)
    if (error.code === 'P2002') {
      throw new Error('Bu isimde bir yazıcı zaten mevcut.')
    }
    throw new Error(error.message || 'Bir hata oluştu.')
  }
}
