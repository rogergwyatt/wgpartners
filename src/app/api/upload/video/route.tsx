import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/adminAuth'

// Direct-to-Blob client uploads for product videos. The browser uploads the
// MP4 straight to Vercel Blob (bypassing the ~4.5MB serverless body limit);
// this route only issues a short-lived, scoped upload token. Admin-gated.
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
        addRandomSuffix: true,
        maximumSizeInBytes: 200 * 1024 * 1024, // 200 MB
      }),
      // No-op: we persist the returned URL via the admin drops API instead.
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(jsonResponse)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Upload failed' }, { status: 400 })
  }
}
