'use server'

import { updateCompatibleCartridges, searchCartridges } from './detail-repo'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

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
  const assignedTo = formData.get('assignedTo')?.toString()?.trim() || undefined
  const ipAddress = formData.get('ipAddress')?.toString()?.trim() || undefined
  const notes = formData.get('notes')?.toString()?.trim() || undefined
  const departmentId = formData.get('departmentId')?.toString()
  if (!departmentId) throw new Error('Departman seçimi zorunludur.')

  if (serialNumber) {
    const existingPrinter = await prisma.printer.findFirst({
      where: { serialNumber },
    });

    if (existingPrinter) {
      throw new Error('Bu seri no zaten tanımlı.')
    }
  }

  if (ipAddress) {
    const existingByIp = await prisma.printer.findFirst({
      where: { ipAddress },
    });

    if (existingByIp) {
      throw new Error(`Bu IP adresi (${ipAddress}) şu an başka bir cihaza tanımlı.`)
    }
  }


  await (await import('./repo')).createPrinter(printerModelId, {
    serialNumber,
    assignedTo,
    ipAddress,
    notes,
    departmentId
  })

  revalidatePath(`/printers/${printerModelId}`)
  revalidatePath('/printers')
  revalidatePath(`/departments/${departmentId}`)
}

export async function updatePhysicalPrinter(formData: FormData) {
  const printerId = formData.get('id')?.toString()
  if (!printerId) throw new Error('Printer id missing')

  const printerModelId = formData.get('printerModelId')?.toString()
  if (!printerModelId) throw new Error('Printer model id missing')

  const serialNumber = formData.get('serialNumber')?.toString()?.trim() || undefined
  const assignedTo = formData.get('assignedTo')?.toString()?.trim() || undefined
  const ipAddress = formData.get('ipAddress')?.toString()?.trim() || undefined
  const notes = formData.get('notes')?.toString()?.trim() || undefined
  const movementNotes = formData.get('movementNotes')?.toString()?.trim() || undefined
  const departmentId = formData.get('departmentId')?.toString()
  if (!departmentId) throw new Error('Departman seçimi zorunludur.')

  const current = await prisma.printer.findUnique({
    where: { id: printerId },
    select: { departmentId: true },
  })

  await (await import('./repo')).updatePrinterInstance(printerId, {
    serialNumber,
    assignedTo,
    ipAddress,
    notes,
    movementNotes,
    departmentId
  })

  revalidatePath(`/printers/${printerModelId}`)
  revalidatePath('/printers')
  revalidatePath(`/departments/${departmentId}`)
  if (current?.departmentId && current.departmentId !== departmentId) {
    revalidatePath(`/departments/${current.departmentId}`)
  }
}

export async function deletePhysicalPrinter(formData: FormData) {
  const printerId = formData.get('id')?.toString()
  if (!printerId) throw new Error('Printer id missing')

  const printerModelId = formData.get('printerModelId')?.toString()
  if (!printerModelId) throw new Error('Printer model id missing')

  const current = await prisma.printer.findUnique({
    where: { id: printerId },
    select: { departmentId: true },
  })

  await (await import('./repo')).removePrinterInstance(printerId)

  revalidatePath(`/printers/${printerModelId}`)
  revalidatePath('/printers')
  if (current?.departmentId) revalidatePath(`/departments/${current.departmentId}`)
}
