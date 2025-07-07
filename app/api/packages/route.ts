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

    // Get basic package information
    const { data: packages, error } = await supabase
      .from('travel_packages')
      .select(`
        id,
        title,
        subtitle,
        description,
        overview,
        price,
        duration,
        location,
        image_url,
        hero_image_url,
        hero_image_alt,
        group_size,
        advance_payment,
        balance_payment,
        departure_place,
        departure_date,
        departure_type,
        activities_display_type,
        is_kerala_tours,
        is_customized_tours,
        is_trending,
        is_upcoming,
        is_international,
        is_domestic
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      packages 
    }, { 
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })

  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
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