import { notFound } from 'next/navigation'
import { getInstanceById } from '@/features/printers/instance-detail-repo'
import { PrinterInstanceDetailClient } from '@/features/printers/components/PrinterInstanceDetailClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const printer = await getInstanceById(id)

  return {
    title: printer ? `${printer.printerModel.name} - ${printer.serialNumber || 'Yazıcı'}` : 'Yazıcı',
  }
}

export default async function PrinterInstancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const printer = await getInstanceById(id)

  if (!printer) notFound()

  return <PrinterInstanceDetailClient printer={printer} />
}
