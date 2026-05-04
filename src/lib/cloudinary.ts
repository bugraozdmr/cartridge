import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file: File, folder: string): Promise<string | null> {
  if (!file || file.size === 0) {
    console.log('[Cloudinary] Dosya boş, upload atlandı.')
    return null
  }

  const cfg = cloudinary.config()
  console.log('[Cloudinary] Config check → cloud_name:', cfg.cloud_name, '| api_key:', cfg.api_key ? '✓' : '✗', '| api_secret:', cfg.api_secret ? '✓' : '✗')

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log(`[Cloudinary] Upload başlıyor → folder: belediye/${folder}, size: ${buffer.length} bytes`)

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `belediye/${folder}`, resource_type: 'auto' },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary] Upload hatası:', error)
            reject(error)
          } else if (result) {
            console.log('[Cloudinary] Upload başarılı:', result.secure_url)
            resolve(result)
          } else {
            reject(new Error('Cloudinary sonuç döndürmedi'))
          }
        }
      )
      stream.end(buffer)
    })

    return result.secure_url
  } catch (error: any) {
    console.error('[Cloudinary] Exception:', error?.message || error)
    return null
  }
}
