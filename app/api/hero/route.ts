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

    // Get active hero media ordered by carousel order
    const { data, error } = await supabase
      .from('hero_media')
      .select('id, url, type, carousel_order')
      .eq('is_active', true)
      .order('carousel_order', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      media: data 
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })

  } catch (error) {
    console.error('Error fetching hero media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero media' },
      { status: 500 }
    )
  }
} 