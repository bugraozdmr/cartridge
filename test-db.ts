import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("❌ HATA: DATABASE_URL .env dosyasında bulunamadı!");
  }

  console.log("🔄 Veritabanına bağlanılıyor...");
  console.log(`📍 Hedef: ${connectionString.split("@")[1]}`);

  const adapter = new PrismaMariaDb(connectionString);
  const prisma = new PrismaClient({ adapter });

  try {
    const result = await prisma.$queryRaw`SELECT 1 as test_basarili`;
    console.log("✅ 1. AŞAMA OK: Veritabanı motoru yanıt veriyor!", result);

    const departmentCount = await prisma.department.count();
    const cartridgeCount = await prisma.cartridge.count();
    
    console.log("✅ 2. AŞAMA OK: Tablolar okunabiliyor.");
    console.log(`📊 Sistemdeki Departman Sayısı: ${departmentCount}`);
    console.log(`📊 Sistemdeki Kartuş Çeşidi: ${cartridgeCount}`);

  } catch (error) {
    console.error("❌ BAĞLANTI HATASI:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
    console.log("👋 Test tamamlandı, bağlantılar kapatıldı.");
  }
}

main();