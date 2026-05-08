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

export async function addPhysicalPrinter(formData: FormData) {
  const printerModelId = formData.get('printerModelId')?.toString()
  if (!printerModelId) throw new Error('Printer model id missing')

  const serialNumber = formData.get('serialNumber')?.toString()?.trim() || undefined
  const inventoryNumber = formData.get('inventoryNumber')?.toString()?.trim() || undefined
  const assignedTo = formData.get('assignedTo')?.toString()?.trim() || undefined
  const ipAddress = formData.get('ipAddress')?.toString()?.trim() || undefined
  const notes = formData.get('notes')?.toString()?.trim() || undefined
  const departmentId = formData.get('departmentId')?.toString()
  if (!departmentId) throw new Error('Departman seçimi zorunludur.')

  await (await import('./repo')).createPrinter(printerModelId, {
    serialNumber,
    inventoryNumber,
    assignedTo,
    ipAddress,
    notes,
    departmentId
  })

  revalidatePath(`/printers/${printerModelId}`)
  revalidatePath('/printers')
}

export async function updatePhysicalPrinter(formData: FormData) {
  const printerId = formData.get('id')?.toString()
  if (!printerId) throw new Error('Printer id missing')

  const printerModelId = formData.get('printerModelId')?.toString()
  if (!printerModelId) throw new Error('Printer model id missing')

  const serialNumber = formData.get('serialNumber')?.toString()?.trim() || undefined
  const inventoryNumber = formData.get('inventoryNumber')?.toString()?.trim() || undefined
  const assignedTo = formData.get('assignedTo')?.toString()?.trim() || undefined
  const ipAddress = formData.get('ipAddress')?.toString()?.trim() || undefined
  const notes = formData.get('notes')?.toString()?.trim() || undefined
  const departmentId = formData.get('departmentId')?.toString()
  if (!departmentId) throw new Error('Departman seçimi zorunludur.')

  await (await import('./repo')).updatePrinterInstance(printerId, {
    serialNumber,
    inventoryNumber,
    assignedTo,
    ipAddress,
    notes,
    departmentId
  })

  revalidatePath(`/printers/${printerModelId}`)
  revalidatePath('/printers')
}

export async function deletePhysicalPrinter(formData: FormData) {
  const printerId = formData.get('id')?.toString()
  if (!printerId) throw new Error('Printer id missing')

  const printerModelId = formData.get('printerModelId')?.toString()
  if (!printerModelId) throw new Error('Printer model id missing')

  await (await import('./repo')).removePrinterInstance(printerId)

  revalidatePath(`/printers/${printerModelId}`)
  revalidatePath('/printers')
}
