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

    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('id, question, answer')
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      faqs 
    }, { 
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    })

  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
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