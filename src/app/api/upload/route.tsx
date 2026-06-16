import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED = ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf']
const MAX_BYTES = 4 * 1024 * 1024 // 4 MB (within the serverless body limit)

// Server-side upload: the browser POSTs the file as multipart/form-data, we
// validate type/size and store it in Vercel Blob, returning the public URL.
// Simpler and more reliable than the client-upload handshake for small files.
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Use PNG, JPG, SVG, or PDF.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File is too large (max 4 MB).' }, { status: 400 })
    }

    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Upload failed' }, { status: 500 })
  }
}
