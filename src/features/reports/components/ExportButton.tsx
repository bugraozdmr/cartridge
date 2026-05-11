'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DownloadIcon, Loader2Icon } from 'lucide-react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface ExportButtonProps {
  data: {
    stockEntries: any[]
    stockOuts: { date: Date | string; departmentName: string; cartridgeName: string; quantity: number; printerLabel?: string | null }[]
  }
  startDate: Date
  endDate: Date
}

export function ExportButton({ data, startDate, endDate }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const workbook = new ExcelJS.Workbook()
      
      // 1. Sheet: Stok Girişleri
      const entrySheet = workbook.addWorksheet('Stok Girişleri')
      
      entrySheet.columns = [
        { header: 'Tarih', key: 'date', width: 18 },
        { header: 'Ürün Adı', key: 'name', width: 45 },
        { header: 'Miktar', key: 'quantity', width: 12 },
        { header: 'Birim Fiyat', key: 'unitPrice', width: 18 },
        { header: 'Toplam', key: 'total', width: 20 },
      ]

      // Header Style
      entrySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
      entrySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }

      let totalEntryValue = 0
      let totalQuantity = 0

      data.stockEntries.forEach(e => {
        const qty = Number(e.quantity) || 0
        const price = Number(e.unitPrice) || 0
        const rowTotal = Number(e.total) || (qty * price)

        const row = entrySheet.addRow({
          date: format(new Date(e.date), 'dd MMMM yyyy', { locale: tr }),
          name: e.name,
          quantity: qty,
          unitPrice: price,
          total: rowTotal
        })
        
        totalEntryValue += rowTotal
        totalQuantity += qty
        
        row.getCell('unitPrice').numFmt = '#,##0.00 "₺"'
        row.getCell('total').numFmt = '#,##0.00 "₺"'
      })

      // GENEL TOPLAM SATIRI - EN SAĞLAM YÖNTEM
      const entryTotalRow = entrySheet.addRow([
        '',
        'GENEL TOPLAM',
        totalQuantity,
        '',
        totalEntryValue,
      ])

      entryTotalRow.font = { bold: true, size: 12 }
      entryTotalRow.getCell(3).numFmt = '0'
      entryTotalRow.getCell('total').numFmt = '#,##0.00 "₺"'
      
      // Arka plan rengi ve üst çizgi
      entryTotalRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }
        cell.border = { top: { style: 'medium' } }
      })

      // 2. Sheet: Stok Çıkışları
      const outSheet = workbook.addWorksheet('Stok Çıkışları')
      outSheet.columns = [
        { header: 'İşlem Tarihi', key: 'date', width: 18 },
        { header: 'Departman', key: 'department', width: 35 },
        { header: 'Yazıcı', key: 'printer', width: 35 },
        { header: 'Ürün Adı', key: 'cartridge', width: 45 },
        { header: 'Miktar', key: 'quantity', width: 15 },
      ]

      outSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
      outSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF43F5E' } }

      let totalOutQty = 0
      data.stockOuts.forEach(o => {
        const qty = Number(o.quantity) || 0
        outSheet.addRow({
          date: format(new Date(o.date), 'dd MMMM yyyy', { locale: tr }),
          department: o.departmentName,
          printer: o.printerLabel || '—',
          cartridge: o.cartridgeName,
          quantity: qty
        })
        totalOutQty += qty
      })

      const outTotalRow = outSheet.addRow({
        date: '',
        department: '',
        printer: '',
        cartridge: 'TOPLAM TÜKETİM',
        quantity: totalOutQty
      })
      outTotalRow.font = { bold: true }
      outTotalRow.border = { top: { style: 'medium' } }

      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(new Blob([buffer]), `Envanter_Raporu_${format(startDate, 'dd_MM_yyyy')}.xlsx`)
      
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button 
      onClick={handleExport}
      disabled={isExporting}
      variant="outline" 
      className="h-11 w-full rounded-xl gap-2 border-border bg-card/60 font-bold text-xs uppercase tracking-widest hover:bg-muted transition-all sm:w-auto"
    >
      {isExporting ? <Loader2Icon className="animate-spin h-4 w-4" /> : <DownloadIcon h-4 w-4 />}
      {isExporting ? 'Hazırlanıyor...' : 'Excel Aktar'}
    </Button>
  )
}