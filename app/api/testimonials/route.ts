import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { authMiddleware } from '../auth/middleware'

export async function GET(request: NextRequest) {
  // Check authentication
  const authResponse = await authMiddleware(request)
  if (authResponse) return authResponse

  try {
    const supabase = await createClient()

    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select('id, client_name, message, image_url')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      testimonials 
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })

  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    )
  }
} 