import CartridgeList from './CartridgeList'
import { getPage } from '@/features/cartridges/repo'

interface CartridgeListContainerProps {
  query: string
  page: number
}

export async function CartridgeListContainer({ query, page }: CartridgeListContainerProps) {
  const data = await getPage({ query, page, pageSize: 20 })
  return <CartridgeList items={data.items} />
}
