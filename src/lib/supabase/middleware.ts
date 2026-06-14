import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/db/auth'

const COOKIE_NAME = 'vintyl-auth'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const token = request.cookies.get(COOKIE_NAME)?.value
  const payload = token ? verifyToken(token) : null

  if (!payload) {
    if (request.cookies.has(COOKIE_NAME)) {
      response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
    }
  }

  return response
}
