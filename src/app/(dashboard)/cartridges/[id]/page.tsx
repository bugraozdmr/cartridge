import { notFound } from 'next/navigation'
import { getById, getAllDepartments } from '@/features/cartridges/detail-repo'
import { CartridgeDetailClient } from '@/features/cartridges/components/CartridgeDetailClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cartridge = await getById(id)

  return {
    title: cartridge ? `${cartridge.name} | Kartuş` : 'Kartuş',
  }
}

export default async function CartridgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [cartridge, departments] = await Promise.all([getById(id), getAllDepartments()])
  if (!cartridge) notFound()

  return <CartridgeDetailClient cartridge={cartridge} departments={departments} />
}

