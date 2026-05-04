'use server'

import { updateCompatibleCartridges, searchCartridges } from './detail-repo'
import { revalidatePath } from 'next/cache'

export async function updatePrinterCartridges(formData: FormData) {
  const printerId = formData.get('printerId')?.toString()
  if (!printerId) return

  const cartridgeIds = formData.getAll('cartridgeIds').map(v => v.toString())
  await updateCompatibleCartridges(printerId, cartridgeIds)
  revalidatePath(`/printers/${printerId}`)
}

export async function searchCartridgesAction(query: string, excludeIds: string[]) {
  return searchCartridges(query, excludeIds)
}
