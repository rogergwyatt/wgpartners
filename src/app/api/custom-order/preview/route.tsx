import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import {
  buildPreviewSpec,
  generateBoardImage,
  boardPrompt,
  referenceForWood,
  MAX_PAYLOAD_MESSAGES,
  type ChatMessage,
} from '@/lib/customOrderAI'

// Fetch a public reference photo from this deployment and return it as
// inline base64 for the image model. Returns undefined if it can't be loaded.
async function loadReference(
  origin: string,
  path: string,
): Promise<{ data: string; mimeType: string } | undefined> {
  try {
    const res = await fetch(`${origin}${encodeURI(path)}`)
    if (!res.ok) return undefined
    const buf = Buffer.from(await res.arrayBuffer())
    const mimeType = res.headers.get('content-type') || 'image/jpeg'
    return { data: buf.toString('base64'), mimeType }
  } catch {
    return undefined
  }
}

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages' }, { status: 400 })
    }
    if (messages.length > MAX_PAYLOAD_MESSAGES) {
      return NextResponse.json({ error: 'Conversation too long' }, { status: 400 })
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Preview is not configured.' }, { status: 503 })
    }

    const spec = await buildPreviewSpec(messages)

    // Image is best-effort: never block the summary on a render failure.
    let imageUrl: string | null = null
    let imageError = false
    try {
      const reference = await loadReference(req.nextUrl.origin, referenceForWood(spec.wood))
      const b64 = await generateBoardImage(boardPrompt(spec.wood, spec.imagePrompt), reference)
      try {
        // Preferred: store in Vercel Blob and return a durable URL.
        const bytes = Buffer.from(b64, 'base64')
        const blob = await put(`custom-order-preview-${Date.now()}.png`, bytes, {
          access: 'public',
          addRandomSuffix: true,
          contentType: 'image/png',
        })
        imageUrl = blob.url
      } catch (blobErr: any) {
        // Blob not configured (e.g. local dev without BLOB_READ_WRITE_TOKEN):
        // fall back to an inline data URL so the image still displays. In
        // production the token is always present, so this branch isn't hit.
        console.warn('preview blob upload failed, using data URL:', blobErr.message)
        imageUrl = `data:image/png;base64,${b64}`
      }
    } catch (imgErr: any) {
      // Image generation itself failed — non-blocking; summary still returned.
      console.error('preview image error:', imgErr.message)
      imageError = true
    }

    return NextResponse.json({ summary: spec.summary, imageUrl, imageError, wood: spec.wood })
  } catch (err: any) {
    console.error('custom-order preview error:', err.message)
    return NextResponse.json({ error: 'Preview failed. Please try again.' }, { status: 500 })
  }
}
