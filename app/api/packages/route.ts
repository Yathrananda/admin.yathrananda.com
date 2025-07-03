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
        balance_payment
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
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })

  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
} 