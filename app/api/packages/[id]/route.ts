import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { authMiddleware } from '../../auth/middleware'
import { corsMiddleware } from '../../cors/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { 
          status: 404,
          headers: corsHeaders
        }
      )
    }

    // Get related data with error handling
    let itinerary: any[] = []
    let gallery: any[] = []
    let bookingRules: any[] = []
    let cancellationRules: any[] = []
    let packageTestimonials: Array<{ testimonial_id: string }> = []

    try {
      const [
        { data: itineraryData, error: itineraryError },
        { data: galleryData, error: galleryError },
        { data: bookingRulesData, error: bookingRulesError },
        { data: cancellationRulesData, error: cancellationRulesError },
        { data: packageTestimonialsData, error: packageTestimonialsError }
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
          .order('display_order', { ascending: true }),
        supabase
          .from('package_testimonials')
          .select('testimonial_id')
          .eq('package_id', id)
      ])

      // Handle each result individually to prevent one error from breaking everything
      if (!itineraryError && itineraryData) itinerary = itineraryData
      if (!galleryError && galleryData) gallery = galleryData
      if (!bookingRulesError && bookingRulesData) bookingRules = bookingRulesData
      if (!cancellationRulesError && cancellationRulesData) cancellationRules = cancellationRulesData
      if (!packageTestimonialsError && packageTestimonialsData) packageTestimonials = packageTestimonialsData

    } catch (relatedDataError) {
      console.warn('Error fetching related data for package:', id, relatedDataError)
    }

    let itineraryWithDetails: any[] = []
    try {
      itineraryWithDetails = await Promise.all(
        (itinerary || []).map(async (day) => {
          try {
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
          } catch (dayError) {
            console.warn('Error fetching details for itinerary day:', day.id, dayError)
            // Return basic day info if details fail
            return {
              ...day,
              activities: [],
              images: []
            }
          }
        })
      )
    } catch (itineraryDetailsError) {
      console.warn('Error fetching itinerary details for package:', id, itineraryDetailsError)
      itineraryWithDetails = itinerary || []
    }

    let testimonials: Array<{
      id: string
      client_name: string
      message: string
      image_url?: string
    }> = []
    if (packageTestimonials && packageTestimonials.length > 0) {
      try {
        const testimonialIds = packageTestimonials.map(pt => pt.testimonial_id)
        const { data: testimonialData, error: testimonialError } = await supabase
          .from('testimonials')
          .select('id, client_name, message, image_url')
          .in('id', testimonialIds)
        
        if (!testimonialError && testimonialData) {
          testimonials = testimonialData
        }
      } catch (testimonialFetchError) {
        console.warn('Failed to fetch testimonials for package:', id, testimonialFetchError)
      }
    }

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
      },
      testimonials: testimonials
    }

    return NextResponse.json({ 
      package: packageWithDetails 
    }, { 
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })

  } catch (error) {
    console.error('Error fetching package details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch package details' },
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