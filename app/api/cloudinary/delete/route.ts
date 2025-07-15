import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID is required' }, { status: 400 })
    }

    const timestamp = Math.round(new Date().getTime() / 1000)
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

    // Debug logging
    console.log('Cloudinary Delete Request:', {
      publicId,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      cloudName,
      timestamp
    })

    if (!apiKey || !apiSecret || !cloudName) {
      const missingVars = []
      if (!apiKey) missingVars.push('CLOUDINARY_API_KEY')
      if (!apiSecret) missingVars.push('CLOUDINARY_API_SECRET')
      if (!cloudName) missingVars.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
      
      console.error('Missing Cloudinary environment variables:', missingVars)
      return NextResponse.json({ 
        error: 'Cloudinary configuration missing', 
        missing: missingVars 
      }, { status: 500 })
    }

    // Generate signature
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex')

    const formData = new FormData()
    formData.append('public_id', publicId)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp.toString())
    formData.append('signature', signature)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Cloudinary delete error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      return NextResponse.json({ 
        error: 'Failed to delete from Cloudinary',
        details: errorData
      }, { status: 500 })
    }

    const result = await response.json()
    console.log('Cloudinary delete success:', result)
    return NextResponse.json({ success: true, result })

  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 