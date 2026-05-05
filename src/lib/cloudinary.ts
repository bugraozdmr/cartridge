import path from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

export async function uploadImage(file: File, folder: string): Promise<string | null> {
  if (!file || file.size === 0) {
    console.log('[LocalStorage] Dosya boş, upload atlandı.')
    return null
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.resolve(process.cwd(), 'public', 'images', folder)
    await mkdir(uploadsDir, { recursive: true })

    const originalName = file.name || 'image'
    const nameWithoutExt = path.basename(originalName, path.extname(originalName))
    const safeName = nameWithoutExt
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'image'

    const mimeSubtype = file.type?.split('/')[1]?.replace('jpeg', 'jpg').replace(/\+.*$/, '') || 'bin'
    const extension = path.extname(originalName) || `.${mimeSubtype}`
    const fileName = `${safeName}-${Date.now()}-${randomUUID().slice(0, 8)}${extension}`
    const absolutePath = path.join(uploadsDir, fileName)

    await writeFile(absolutePath, buffer)

    const publicUrl = `/images/${folder}/${fileName}`
    console.log('[LocalStorage] Upload başarılı:', publicUrl, '| size:', buffer.length, 'bytes')

    return publicUrl
  } catch (error: any) {
    console.error('[LocalStorage] Exception:', error?.message || error)
    return null
  }
}
