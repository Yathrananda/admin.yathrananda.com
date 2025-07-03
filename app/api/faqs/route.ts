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
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    })

  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    )
  }
} 