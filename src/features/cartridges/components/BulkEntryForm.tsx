'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { bulkAddStockAction } from '../actions'
import { SaveIcon, ArrowLeftIcon, PlusIcon, MinusIcon, Loader2Icon } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface BulkEntryFormProps {
  cartridges: {
    id: string
    name: string
    stock: number
    currentPrice: any
  }[]
}

export function BulkEntryForm({ cartridges }: BulkEntryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  
  // State for quantities and prices
  // We only track items that have a change
  const [entries, setEntries] = useState<Record<string, { quantity: number; unitPrice: string }>>({})

  const filteredCartridges = cartridges.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleQtyChange = (id: string, val: string, defaultPrice: string) => {
    const qty = parseInt(val) || 0
    setEntries(prev => ({
      ...prev,
      [id]: {
        quantity: qty,
        unitPrice: prev[id]?.unitPrice || defaultPrice || '0'
      }
    }))
  }

  const handlePriceChange = (id: string, price: string) => {
    setEntries(prev => ({
      ...prev,
      [id]: {
        quantity: prev[id]?.quantity || 0,
        unitPrice: price
      }
    }))
  }

  const handleSubmit = async () => {
    const finalEntries = Object.entries(entries)
      .filter(([_, data]) => data.quantity > 0)
      .map(([id, data]) => ({
        cartridgeId: id,
        quantity: data.quantity,
        unitPrice: data.unitPrice
      }))

    if (finalEntries.length === 0) {
      toast.error('Lütfen en az bir ürün için miktar giriniz.')
      return
    }

    setIsSubmitting(true)
    try {
      await bulkAddStockAction(finalEntries)
      toast.success('Stoklar başarıyla güncellendi.')
      router.push('/cartridges')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalAddedCount = Object.values(entries).reduce((acc, curr) => acc + curr.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Toplu Stok Girişi</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Gelen faturaya göre tüm ürünleri tek seferde işleyin.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/cartridges">
            <Button variant="outline" className="rounded-xl border-border bg-card/60">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              İptal
            </Button>
          </Link>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || totalAddedCount === 0}
            className="rounded-xl bg-primary px-6 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            {isSubmitting ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <SaveIcon className="mr-2 h-4 w-4" />
            )}
            Hepsini Kaydet
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card/60 rounded-[2rem] overflow-hidden shadow-sm">
        <CardHeader className="border-b border-border/50 px-8 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Ürün Listesi</CardTitle>
              <CardDescription>Miktar ve birim fiyat girerek stok ekleyin.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Ürün ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl bg-muted/40 border-border/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-border/50 hover:bg-muted/30">
                  <TableHead className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest">Ürün Adı</TableHead>
                  <TableHead className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-center">Mevcut Stok</TableHead>
                  <TableHead className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest w-40 text-center">Gelen Miktar</TableHead>
                  <TableHead className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest w-48 text-center">Birim Fiyat (TL)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/50">
                {filteredCartridges.map((c) => {
                  const entry = entries[c.id] || { quantity: 0, unitPrice: c.currentPrice?.toString() || '0' }
                  return (
                    <TableRow key={c.id} className={cn("group transition-colors", entry.quantity > 0 ? "bg-primary/5" : "hover:bg-muted/20")}>
                      <TableCell className="px-8 py-4 font-semibold text-foreground">{c.name}</TableCell>
                      <TableCell className="px-8 py-4 text-center">
                        <span className="inline-flex h-8 w-12 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground border border-border/50">
                          {c.stock}
                        </span>
                      </TableCell>
                      <TableCell className="px-8 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-border/50 hover:bg-primary hover:text-white transition-colors"
                            onClick={() => handleQtyChange(c.id, (entry.quantity - 1).toString(), c.currentPrice?.toString())}
                            disabled={entry.quantity <= 0}
                          >
                            <MinusIcon className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            className="h-9 w-20 text-center rounded-xl bg-background border-border/50 focus:border-primary transition-all font-bold"
                            value={entry.quantity || ''}
                            onChange={(e) => handleQtyChange(c.id, e.target.value, c.currentPrice?.toString())}
                            placeholder="0"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-border/50 hover:bg-primary hover:text-white transition-colors"
                            onClick={() => handleQtyChange(c.id, (entry.quantity + 1).toString(), c.currentPrice?.toString())}
                          >
                            <PlusIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-4">
                        <Input
                          type="number"
                          step="0.01"
                          className="h-9 w-full rounded-xl bg-background border-border/50 text-right font-medium"
                          value={entry.unitPrice}
                          onChange={(e) => handlePriceChange(c.id, e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-8 right-8 z-50 sm:hidden">
        <Button 
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting || totalAddedCount === 0}
          className="h-14 w-14 rounded-full bg-primary p-0 shadow-2xl shadow-primary/40 ring-4 ring-background"
        >
          {isSubmitting ? (
            <Loader2Icon className="h-6 w-6 animate-spin" />
          ) : (
            <SaveIcon className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  )
}
