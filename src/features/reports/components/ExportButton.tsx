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
    stockOuts: any[]
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
      workbook.creator = 'Bilgi İşlem Stok Takip'
      workbook.lastModifiedBy = 'Bilgi İşlem'
      workbook.created = new Date()

      // 1. Sheet: Stock Entries
      const entrySheet = workbook.addWorksheet('Stok Girişleri', {
        views: [{ state: 'frozen', ySplit: 1 }]
      })
      
      entrySheet.columns = [
        { header: 'Tarih', key: 'date', width: 18 },
        { header: 'Ürün Adı', key: 'name', width: 45 },
        { header: 'Miktar', key: 'quantity', width: 12 },
        { header: 'Birim Fiyat', key: 'unitPrice', width: 18 },
        { header: 'Toplam', key: 'total', width: 20 },
      ]

      // Style header
      const headerRow = entrySheet.getRow(1)
      headerRow.height = 25
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF10B981' } // Emerald 500
        }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })

      let totalEntryValue = 0
      data.stockEntries.forEach(e => {
        const row = entrySheet.addRow({
          date: format(new Date(e.date), 'dd MMMM yyyy', { locale: tr }),
          name: e.name,
          quantity: e.quantity,
          unitPrice: e.unitPrice,
          total: e.total
        })
        totalEntryValue += e.total
        
        // Format currency cells
        row.getCell('unitPrice').numFmt = '#,##0.00 "₺"'
        row.getCell('total').numFmt = '#,##0.00 "₺"'
        row.alignment = { vertical: 'middle' }
      })

      // Add Total Row
      const entryTotalRow = entrySheet.addRow({
        name: 'GENEL TOPLAM',
        total: totalEntryValue
      })
      entryTotalRow.font = { bold: true, size: 12 }
      entryTotalRow.getCell('total').numFmt = '#,##0.00 "₺"'
      entryTotalRow.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' }
        }
        cell.border = { top: { style: 'medium' } }
      })

      // 2. Sheet: Stock Outs
      const outSheet = workbook.addWorksheet('Stok Çıkışları', {
        views: [{ state: 'frozen', ySplit: 1 }]
      })
      outSheet.columns = [
        { header: 'İşlem Tarihi', key: 'date', width: 18 },
        { header: 'Departman', key: 'department', width: 35 },
        { header: 'Ürün Adı', key: 'cartridge', width: 45 },
        { header: 'Miktar', key: 'quantity', width: 15 },
      ]

      const outHeaderRow = outSheet.getRow(1)
      outHeaderRow.height = 25
      outHeaderRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF43F5E' } // Rose 500
        }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })

      let totalOutQty = 0
      data.stockOuts.forEach(o => {
        const row = outSheet.addRow({
          date: format(new Date(o.date), 'dd MMMM yyyy', { locale: tr }),
          department: o.departmentName,
          cartridge: o.cartridgeName,
          quantity: o.quantity
        })
        totalOutQty += o.quantity
        row.alignment = { vertical: 'middle' }
      })

      const outTotalRow = outSheet.addRow({
        cartridge: 'TOPLAM TÜKETİM',
        quantity: totalOutQty
      })
      outTotalRow.font = { bold: true }
      outTotalRow.border = { top: { style: 'medium' } }

      // Generate buffer and save
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const fileName = `Envanter_Raporu_${format(startDate, 'dd_MM_yyyy')}_${format(endDate, 'dd_MM_yyyy')}.xlsx`
      saveAs(blob, fileName)
      
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
      {isExporting ? (
        <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <DownloadIcon className="h-3.5 w-3.5" />
      )}
      {isExporting ? 'Hazırlanıyor...' : 'Excel Aktar'}
    </Button>
  )
}
