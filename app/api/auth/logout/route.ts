import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // Clear the auth cookie
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")

  return new NextResponse(
    JSON.stringify({ success: true }),
    { status: 200 }
  )
} 