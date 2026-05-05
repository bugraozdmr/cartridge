'use server'

import * as repo from './repo'
import { revalidatePath } from 'next/cache'

export async function addDepartment(formData: FormData) {
  const name = formData.get('name')?.toString()?.trim()
  if (!name) throw new Error('Departman adı zorunludur.')
  try {
    await repo.create(name)
  } catch (error) {
    const e = error as { code?: string; message?: string }
    if (e?.code === 'P2002') throw new Error('Bu isimde departman zaten var.')
    throw error
  }
  revalidatePath('/departments')
}

export async function deleteDepartment(formData: FormData) {
  const id = formData.get('id')?.toString()
  if (!id) throw new Error('ID eksik.')
  try {
    await repo.remove(id)
  } catch (error) {
    const e = error as { code?: string; message?: string }
    if (e?.code === 'P2003') throw new Error('Bu departmana bağlı stok çıkışı olduğu için silinemez.')
    throw error
  }
  revalidatePath('/departments')
}

export async function updateDepartment(formData: FormData) {
  const id = formData.get('id')?.toString()
  const name = formData.get('name')?.toString()?.trim()
  if (!id) throw new Error('ID eksik.')
  if (!name) throw new Error('Departman adı zorunludur.')
  try {
    await repo.updateDepartment(id, name)
  } catch (error) {
    const e = error as { code?: string; message?: string }
    if (e?.code === 'P2002') throw new Error('Bu isimde departman zaten var.')
    throw error
  }
  revalidatePath('/departments')
}
