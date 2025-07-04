import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secretKey = process.env.JWT_SECRET_KEY || "your-secret-key-min-32-chars-long!!"
const key = new TextEncoder().encode(secretKey)

// Add any public routes that don't need authentication
const publicRoutes = ["/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get("auth-token")

  if (!token) {
    return redirectToLogin(request)
  }

  try {
    // Verify JWT
    await jwtVerify(token.value, key)
    return NextResponse.next()
  } catch (error) {
    // Token is invalid or expired
    return redirectToLogin(request)
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
} 