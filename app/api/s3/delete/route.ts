import { NextRequest, NextResponse } from 'next/server'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

/**
 * Derives the S3 object key from a full S3 URL.
 * e.g. https://bucket.s3.region.amazonaws.com/hero/123-uuid.jpg → hero/123-uuid.jpg
 */
function extractKeyFromUrl(url: string): string | null {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL
    if (baseUrl && url.startsWith(baseUrl)) {
      return url.slice(baseUrl.length + 1) // strip trailing slash
    }
    // Fallback: parse as URL and use pathname (strip leading slash)
    const parsed = new URL(url)
    return parsed.pathname.slice(1)
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fileUrl } = await request.json()

    if (!fileUrl) {
      return NextResponse.json({ error: 'fileUrl is required' }, { status: 400 })
    }

    const bucket = process.env.AWS_S3_BUCKET_NAME
    if (!bucket) {
      return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500 })
    }

    const key = extractKeyFromUrl(fileUrl)
    if (!key) {
      return NextResponse.json({ error: 'Could not derive object key from URL' }, { status: 400 })
    }

    console.log('S3 Delete Request:', { fileUrl, key, bucket })

    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))

    console.log('S3 delete success:', key)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting from S3:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
