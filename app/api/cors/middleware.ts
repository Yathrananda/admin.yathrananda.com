import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function corsMiddleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  
  const allowedOrigins = [
    process.env.PROMO_WEB_URL || 'http://localhost:3000',
    'https://yathrananda.com',
    'https://www.yathrananda.com'
  ]

  const isAllowedOrigin = origin && allowedOrigins.includes(origin)
  
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
    'Access-Control-Max-Age': '86400'
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 204,
      headers
    })
  }

  return headers
} 