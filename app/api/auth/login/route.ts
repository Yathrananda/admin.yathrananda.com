import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { SignJWT } from "jose"

const secretKey = process.env.JWT_SECRET_KEY || "your-secret-key-min-32-chars-long!!"
const key = new TextEncoder().encode(secretKey)

// These would typically be stored securely, not hardcoded
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return new NextResponse(
        JSON.stringify({ error: "Username and password are required" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      )
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid username or password" }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      )
    }

    // Create JWT token
    const token = await new SignJWT({ username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(key)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, 
      path: "/",
    })

    return new NextResponse(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    )
  } catch (error) {
    console.error("Login error:", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
} 