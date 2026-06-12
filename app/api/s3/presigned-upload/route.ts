import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType, folder } = await request.json()

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'filename and contentType are required' },
        { status: 400 }
      )
    }

    const bucket = process.env.AWS_S3_BUCKET_NAME
    if (!bucket) {
      return NextResponse.json(
        { error: 'S3 bucket not configured' },
        { status: 500 }
      )
    }

    // Build a unique object key: folder/timestamp-uuid.ext
    const ext = filename.split('.').pop() || 'bin'
    const prefix = folder || 'uploads'
    const objectKey = `${prefix}/${Date.now()}-${randomUUID()}.${ext}`

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: contentType,
    })

    // Presigned URL valid for 5 minutes
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 })

    const baseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL
    const fileUrl = `${baseUrl}/${objectKey}`

    return NextResponse.json({ presignedUrl, fileUrl, objectKey })
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
