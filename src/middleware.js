import { NextResponse } from 'next/server'
import { ACCESS_TOKEN_HEADER, REFRESH_COOKIE, USER_COOKIE, sessionCookieOptions } from '@/auth/constants'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const PUBLIC_PATHS = ['/', '/login', '/callback', '/invite']

// Refresh this long before the access token expires, so it outlives the request it is attached to.
const EXPIRY_MARGIN_MS = 30 * 1000

// Access tokens live only here, in server memory: refresh token -> { accessToken, expiresAt, refreshToken }.
// A rotated session is stored under both the old and the new refresh token, so requests
// still carrying the old cookie reuse it instead of refreshing again.
const sessions = new Map()
const inFlight = new Map()

function getCachedSession(refreshToken) {
  const session = sessions.get(refreshToken)
  if (!session) return null
  if (session.expiresAt - EXPIRY_MARGIN_MS <= Date.now()) {
    sessions.delete(refreshToken)
    return null
  }
  return session
}

// Resolves to a session, or null when the backend rejects the refresh token. Throws if the backend is unreachable.
async function refreshSession(refreshToken) {
  const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: 'no-store',
  })
  if (res.status >= 500) throw new Error(`Refresh failed: HTTP ${res.status}`)
  if (!res.ok) return null

  const data = await res.json()
  const session = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    refreshToken: data.refresh_token,
  }

  for (const [key, value] of sessions) {
    if (value.expiresAt <= Date.now()) sessions.delete(key)
  }
  sessions.set(refreshToken, session)
  sessions.set(session.refreshToken, session)
  return session
}

async function resolveSession(refreshToken) {
  const cached = getCachedSession(refreshToken)
  if (cached) return { session: cached, invalid: false }

  let pending = inFlight.get(refreshToken)
  if (!pending) {
    pending = refreshSession(refreshToken).finally(() => inFlight.delete(refreshToken))
    inFlight.set(refreshToken, pending)
  }

  try {
    const session = await pending
    return { session, invalid: !session }
  } catch {
    // Backend unreachable: no session for this request, but keep the cookies.
    return { session: null, invalid: false }
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api/')
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  const { session, invalid } = refreshToken
    ? await resolveSession(refreshToken)
    : { session: null, invalid: false }

  const headers = new Headers(request.headers)
  headers.delete(ACCESS_TOKEN_HEADER)
  if (session) headers.set(ACCESS_TOKEN_HEADER, session.accessToken)

  const response = session || isPublic || isApi
    ? NextResponse.next({ request: { headers } })
    : NextResponse.redirect(new URL('/login', request.url))

  if (session && session.refreshToken !== refreshToken) {
    // The backend rotates the refresh token on every refresh; the old one is now spent.
    response.cookies.set(REFRESH_COOKIE, session.refreshToken, sessionCookieOptions({ httpOnly: true }))
    const user = request.cookies.get(USER_COOKIE)?.value
    if (user) response.cookies.set(USER_COOKIE, user, sessionCookieOptions({ httpOnly: false }))
  } else if (invalid) {
    response.cookies.delete(REFRESH_COOKIE)
    response.cookies.delete(USER_COOKIE)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|manifest.json|workbox-.*\\.js|sw.js|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
