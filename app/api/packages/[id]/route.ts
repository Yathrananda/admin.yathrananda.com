import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { authMiddleware } from '../../auth/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authResponse = await authMiddleware(request)
  if (authResponse) return authResponse

  try {
    const supabase = await createClient()
    const { id } = params

    // Get package basic info
    const { data: packageData, error: packageError } = await supabase
      .from('travel_packages')
      .select('*')
      .eq('id', id)
      .single()

    if (packageError) throw packageError
    if (!packageData) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Get related data
    const [
      { data: itinerary },
      { data: gallery },
      { data: bookingRules },
      { data: cancellationRules }
    ] = await Promise.all([
      supabase
        .from('package_itinerary')
        .select('*')
        .eq('package_id', id)
        .order('display_order', { ascending: true }),
      supabase
        .from('package_gallery')
        .select('*')
        .eq('package_id', id)
        .order('display_order', { ascending: true }),
      supabase
        .from('package_booking_rules')
        .select('*')
        .eq('package_id', id)
        .order('display_order', { ascending: true }),
      supabase
        .from('package_cancellation_rules')
        .select('*')
        .eq('package_id', id)
        .order('display_order', { ascending: true })
    ])

    // Get activities and images for each itinerary day
    const itineraryWithDetails = await Promise.all(
      (itinerary || []).map(async (day) => {
        const [{ data: activities }, { data: images }] = await Promise.all([
          supabase
            .from('itinerary_activities')
            .select('*')
            .eq('itinerary_id', day.id)
            .order('display_order', { ascending: true }),
          supabase
            .from('itinerary_images')
            .select('*')
            .eq('itinerary_id', day.id)
            .order('display_order', { ascending: true })
        ])

        return {
          ...day,
          activities: activities?.map((a) => a.activity) || [],
          images: images?.map(img => ({
            url: img.url,
            alt: img.alt || ''
          })) || []
        }
      })
    )

    const packageWithDetails = {
      ...packageData,
      itinerary: itineraryWithDetails,
      gallery: (gallery || []).map(img => ({
        url: img.url,
        alt: img.alt || '',
        caption: img.caption || ''
      })),
      bookingInfo: {
        advancePayment: packageData.advance_payment || '',
        balancePayment: packageData.balance_payment || '',
        bookingRules: bookingRules?.map((r) => r.rule) || []
      },
      cancellationPolicy: {
        rules: cancellationRules?.map((r) => r.rule) || []
      }
    }

    return NextResponse.json({ 
      package: packageWithDetails 
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })

  } catch (error) {
    console.error('Error fetching package details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch package details' },
      { status: 500 }
    )
  }
} 