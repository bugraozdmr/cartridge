'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DownloadIcon, Loader2Icon, Building2Icon, CheckIcon } from 'lucide-react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

type DepartmentOption = {
  id: string
  name: string
}

type StockOutExportRow = {
  date: Date | string
  departmentName: string
  cartridgeName: string
  quantity: number
  printerLabel?: string | null
}

interface ReportExportControlsProps {
  data: {
    stockEntries: any[]
    stockOuts: StockOutExportRow[]
  }
  departments: DepartmentOption[]
  startDate: Date
  endDate: Date
}

export function ReportExportControls({ data, departments, startDate, endDate }: ReportExportControlsProps) {
  const [isPurchasingExporting, setIsPurchasingExporting] = useState(false)
  const [isOutExporting, setIsOutExporting] = useState(false)
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(departments.map(d => d.id))

  const selectedLabel = useMemo(() => {
    if (selectedDepartments.length === 0 || selectedDepartments.length === departments.length) {
      return 'Tüm departmanlar'
    }

    return `${selectedDepartments.length} departman seçili`
  }, [departments.length, selectedDepartments])

  const buildWorkbook = () => {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Bilgi İşlem Stok Takip'
    workbook.lastModifiedBy = 'Bilgi İşlem'
    workbook.created = new Date()
    return workbook
  }

  const exportPurchases = async () => {
    setIsPurchasingExporting(true)
    try {
      const workbook = buildWorkbook()

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

      const headerRow = entrySheet.getRow(1)
      headerRow.height = 25
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      })

      let totalEntryValue = 0
      data.stockEntries.forEach((entry) => {
        const row = entrySheet.addRow({
          date: format(new Date(entry.date), 'dd MMMM yyyy', { locale: tr }),
          name: entry.name,
          quantity: entry.quantity,
          unitPrice: entry.unitPrice,
          total: entry.total,
        })

        totalEntryValue += entry.total
        row.getCell('unitPrice').numFmt = '#,##0.00 "₺"'
        row.getCell('total').numFmt = '#,##0.00 "₺"'
        row.alignment = { vertical: 'middle' }
      })

      const totalRow = entrySheet.addRow({ name: 'GENEL TOPLAM', total: totalEntryValue })
      totalRow.font = { bold: true, size: 12 }
      totalRow.getCell('total').numFmt = '#,##0.00 "₺"'
      totalRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }
        cell.border = { top: { style: 'medium' } }
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const fileName = `Satın_Alımlar_${format(startDate, 'dd_MM_yyyy')}_${format(endDate, 'dd_MM_yyyy')}.xlsx`
      saveAs(blob, fileName)
    } catch (error) {
      console.error('Purchase export failed:', error)
    } finally {
      setIsPurchasingExporting(false)
    }
  }

  const exportStockOuts = async () => {
    setIsOutExporting(true)
    try {
      const workbook = buildWorkbook()
      const outSheet = workbook.addWorksheet('Stok Çıkışları', {
        views: [{ state: 'frozen', ySplit: 1 }]
      })

      outSheet.columns = [
        { header: 'İşlem Tarihi', key: 'date', width: 18 },
        { header: 'Departman', key: 'department', width: 35 },
        { header: 'Yazıcı', key: 'printer', width: 35 },
        { header: 'Ürün Adı', key: 'cartridge', width: 45 },
        { header: 'Miktar', key: 'quantity', width: 15 },
      ]

      const headerRow = outSheet.getRow(1)
      headerRow.height = 25
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF43F5E' } }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      })

      const selectedSet = new Set(selectedDepartments)
      const shouldUseAll = selectedSet.size === 0 || selectedSet.size === departments.length
      const filteredOuts = shouldUseAll
        ? data.stockOuts
        : data.stockOuts.filter((row) => {
            const department = departments.find((item) => item.name === row.departmentName)
            return department ? selectedSet.has(department.id) : false
          })

      let totalOutQty = 0
      filteredOuts.forEach((out) => {
        const row = outSheet.addRow({
          date: format(new Date(out.date), 'dd MMMM yyyy', { locale: tr }),
          department: out.departmentName,
          printer: out.printerLabel || '—',
          cartridge: out.cartridgeName,
          quantity: out.quantity,
        })

        totalOutQty += out.quantity
        row.alignment = { vertical: 'middle' }
      })

      const totalRow = outSheet.addRow({ cartridge: 'TOPLAM TÜKETİM', quantity: totalOutQty })
      totalRow.font = { bold: true }
      totalRow.border = { top: { style: 'medium' } }

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const fileName = `Stok_Cikislari_${format(startDate, 'dd_MM_yyyy')}_${format(endDate, 'dd_MM_yyyy')}.xlsx`
      saveAs(blob, fileName)
    } catch (error) {
      console.error('Stock out export failed:', error)
    } finally {
      setIsOutExporting(false)
    }
  }

  const toggleDepartment = (departmentId: string) => {
    setSelectedDepartments((current) =>
      current.includes(departmentId)
        ? current.filter((item) => item !== departmentId)
        : [...current, departmentId]
    )
  }

  const selectAllDepartments = () => setSelectedDepartments(departments.map((d) => d.id))
  const clearDepartments = () => setSelectedDepartments([])

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
      <Button
        type="button"
        onClick={exportPurchases}
        disabled={isPurchasingExporting}
        variant="outline"
        className="h-11 w-full rounded-xl gap-2 border-border bg-card/60 font-bold text-xs uppercase tracking-widest hover:bg-muted transition-all sm:w-auto"
      >
        {isPurchasingExporting ? (
          <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <DownloadIcon className="h-3.5 w-3.5" />
        )}
        Satın Alım Excel
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl gap-2 border-border bg-card/60 font-bold text-xs uppercase tracking-widest hover:bg-muted transition-all sm:w-auto"
          >
            <Building2Icon className="h-3.5 w-3.5" />
            Çıkış Excel
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Çıkış Excel</DialogTitle>
            <DialogDescription>
              Belirli departmanların çıkışlarını ya da tüm departmanları seçerek dışa aktarabilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={selectAllDepartments}>
                Tümünü Seç
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearDepartments}>
                Seçimi Temizle
              </Button>
              <span className="text-xs text-muted-foreground">{selectedLabel}</span>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-border bg-muted/20 p-3">
              {departments.length > 0 ? departments.map((department) => {
                const checked = selectedDepartments.includes(department.id)

                return (
                  <label key={department.id} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDepartment(department.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <span className="flex-1 text-sm font-medium text-foreground">{department.name}</span>
                    {checked && <CheckIcon className="h-4 w-4 text-primary" />}
                  </label>
                )
              }) : (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">Departman bulunamadı.</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <Button type="button" variant="outline" onClick={exportStockOuts} disabled={isOutExporting}>
                {isOutExporting ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <DownloadIcon className="h-3.5 w-3.5" />}
                Seçilenleri Aktar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}