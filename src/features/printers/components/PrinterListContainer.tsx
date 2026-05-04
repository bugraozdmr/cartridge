import PrinterList from './PrinterList'
import { getPage } from '@/features/printers/repo'

interface PrinterListContainerProps {
  query: string
  page: number
}

export async function PrinterListContainer({ query, page }: PrinterListContainerProps) {
  const data = await getPage({ query, page, pageSize: 20 })
  return <PrinterList items={data.items} />
}
