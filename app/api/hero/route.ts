import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { authMiddleware } from '../auth/middleware'
import { corsMiddleware } from '../cors/middleware'

export async function GET(request: NextRequest) {
  // Handle CORS
  const corsHeaders = await corsMiddleware(request)
  if (corsHeaders instanceof NextResponse) {
    return corsHeaders
  }

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
        ...corsHeaders,
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })

  } catch (error) {
    console.error('Error fetching hero media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero media' },
      { 
        status: 500,
        headers: corsHeaders
      }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await corsMiddleware(request)
  return corsHeaders instanceof NextResponse ? corsHeaders : new NextResponse(null, { headers: corsHeaders })
} 