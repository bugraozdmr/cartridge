import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Prisma } from '@prisma/client'
import { prisma } from '../src/lib/prisma'

type CsvRow = Record<string, string>

function csvPath(fileName: string) {
  return path.resolve(process.cwd(), 'save', fileName)
}

function parseCsvLine(line: string) {
  const values: string[] = []
  let currentValue = ''
  let isInQuotes = false

  for (let index = 0; index < line.length; index++) {
    const character = line[index]

    if (character === '"') {
      const nextCharacter = line[index + 1]

      if (isInQuotes && nextCharacter === '"') {
        currentValue += '"'
        index++
      } else {
        isInQuotes = !isInQuotes
      }
      continue
    }

    if (character === ',' && !isInQuotes) {
      values.push(currentValue)
      currentValue = ''
      continue
    }

    currentValue += character
  }

  values.push(currentValue)
  return values
}

function parseCsv(content: string) {
  const lines = content.trim().split(/\r?\n/)
  if (lines.length === 0) return []

  const headers = parseCsvLine(lines[0]).map((header) => header.trim())

  return lines.slice(1).filter(Boolean).map((line) => {
    const values = parseCsvLine(line)
    return headers.reduce<CsvRow>((row, header, index) => {
      row[header] = values[index] ?? ''
      return row
    }, {})
  })
}

function toNullable(value: string | undefined) {
  if (!value) return null
  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

async function readCsv(fileName: string) {
  const content = await readFile(csvPath(fileName), 'utf8')
  return parseCsv(content)
}

// Rastgele tarih üretici (1 Haziran 2025 - 5 Mayıs 2026)
function getRandomDate() {
  const start = new Date('2025-06-01T08:00:00')
  const end = new Date('2026-05-05T11:59:59')
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function main() {
  // NOT: Sadece ana tabloları CSV'den okuyoruz, StockEntry ve StockOut'u kodla üreteceğiz!
  const [cartridgeRows, departmentRows, printerModelRows, cartridgePrinterRows] =
    await Promise.all([
      readCsv('Cartridge.csv'),
      readCsv('Department (1).csv'),
      readCsv('PrinterModel.csv'),
      readCsv('_CartridgeToPrinterModel.csv'),
    ])

  console.log('1. CSV verileri veritabanına aktarılıyor...')

  for (const row of printerModelRows) {
    await prisma.printerModel.upsert({
      where: { id: row.id },
      update: { name: row.name, imageUrl: toNullable(row.imageUrl) },
      create: { id: row.id, name: row.name, imageUrl: toNullable(row.imageUrl) },
    })
  }

  for (const row of cartridgeRows) {
    await prisma.cartridge.upsert({
      where: { id: row.id },
      update: {
        name: row.name,
        currentPrice: new Prisma.Decimal(row.currentPrice || "0"),
        stock: 0, // Stoğu en son hesaplayacağız, şimdilik 0
        imageUrl: toNullable(row.imageUrl),
        printerModels: { set: [] },
      },
      create: {
        id: row.id,
        name: row.name,
        currentPrice: new Prisma.Decimal(row.currentPrice || "0"),
        stock: 0,
        imageUrl: toNullable(row.imageUrl),
      },
    })
  }

  for (const row of departmentRows) {
    await prisma.department.upsert({
      where: { id: row.id },
      update: { name: row.name },
      create: { id: row.id, name: row.name },
    })
  }

  for (const row of cartridgePrinterRows) {
    await prisma.cartridge.update({
      where: { id: row.A },
      data: { printerModels: { connect: { id: row.B } } },
    })
  }

  console.log('2. Ana veriler eklendi. Şimdi dummy stok işlemleri üretiliyor...')

  // Veritabanından eklenen kayıtların ID'lerini çek
  const cartridges = await prisma.cartridge.findMany({ select: { id: true } })
  const departments = await prisma.department.findMany({ select: { id: true } })

  if (cartridges.length > 0 && departments.length > 0) {
    // Önceki işlemleri sil
    await prisma.$transaction([
      prisma.stockEntry.deleteMany(),
      prisma.stockOut.deleteMany(),
    ])

    const receivers = ["Ahmet Kaya", "Ayşe Demir", "Mehmet Çelik", "Fatma Şahin", "Ali Yıldız", "Caner Taş", "Elif Bulut", "Mustafa Koç"]
    const notesPool = ["Acil talep", "Yedeklendi", "Başkanlık talebi", "Etkinlik için", "Güvenlik kulübesi", "Son adet", "Denetim raporları", "Bozuk kartuş değişimi"]

    // --- 100 Adet Rastgele Giriş ---
    const generatedEntries = []
    for (let i = 0; i < 100; i++) {
      const cartridge = cartridges[Math.floor(Math.random() * cartridges.length)]
      generatedEntries.push({
        quantity: Math.floor(Math.random() * 40) + 10,
        unitPrice: new Prisma.Decimal(Math.floor(Math.random() * 30) + 10),
        cartridgeId: cartridge.id,
        entryDate: getRandomDate(),
      })
    }
    await prisma.stockEntry.createMany({ data: generatedEntries })

    // --- 100 Adet Rastgele Çıkış ---
    const generatedOuts = []
    for (let i = 0; i < 100; i++) {
      const cartridge = cartridges[Math.floor(Math.random() * cartridges.length)]
      const department = departments[Math.floor(Math.random() * departments.length)]

      const hasReceiver = Math.random() > 0.4 // %60 ihtimalle alan kişi var
      const hasNote = Math.random() > 0.6     // %40 ihtimalle not var

      generatedOuts.push({
        quantity: Math.floor(Math.random() * 5) + 1,
        cartridgeId: cartridge.id,
        departmentId: department.id,
        receiverName: hasReceiver ? receivers[Math.floor(Math.random() * receivers.length)] : null,
        notes: hasNote ? notesPool[Math.floor(Math.random() * notesPool.length)] : null,
        issueDate: getRandomDate(),
      })
    }
    await prisma.stockOut.createMany({ data: generatedOuts })
    
    console.log('✅ 100 Giriş ve 100 Çıkış rastgele oluşturuldu.')
  }

  console.log('3. Kartuş stokları yeniden hesaplanıyor (Giriş - Çıkış)...')

  for (const cartridge of cartridges) {
    const entryTotals = await prisma.stockEntry.aggregate({
      where: { cartridgeId: cartridge.id },
      _sum: { quantity: true },
    })

    const outTotals = await prisma.stockOut.aggregate({
      where: { cartridgeId: cartridge.id },
      _sum: { quantity: true },
    })

    await prisma.cartridge.update({
      where: { id: cartridge.id },
      data: {
        stock: (entryTotals._sum.quantity ?? 0) - (outTotals._sum.quantity ?? 0),
      },
    })
  }

  console.log('🎉 Seed tamamen bitti! Veritabanı testlere hazır.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })