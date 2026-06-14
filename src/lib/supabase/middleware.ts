import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/db/auth'

const COOKIE_NAME = 'vintyl-auth'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const token = request.cookies.get(COOKIE_NAME)?.value
  const payload = token ? verifyToken(token) : null

  if (!payload) {
    // Token is missing or invalid — clear it if present
    if (request.cookies.has(COOKIE_NAME)) {
      supabaseResponse.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
    }
  }

  return supabaseResponse
}
