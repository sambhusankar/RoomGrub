import { NextResponse } from 'next/server'
import { ACCESS_TOKEN_HEADER, REFRESH_COOKIE, USER_COOKIE, sessionCookieOptions } from '@/auth/constants'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const PUBLIC_PATHS = ['/', '/login', '/callback', '/invite']

// Refresh this long before the access token expires, so it outlives the request it is attached to.
const EXPIRY_MARGIN_MS = 30 * 1000

// A session stays reachable under this many refresh tokens: the current one plus the most recently spent ones.
const MAX_TOKENS_PER_SESSION = 3

// Access tokens live only here, in server memory:
// refresh token -> { accessToken, expiresAt, refreshToken, tokens }.
// A rotated session is stored under both the new refresh token and the spent ones (`tokens`, newest
// first), so requests still carrying an old cookie reuse it instead of refreshing again. Only
// `session.refreshToken` is ever sent to the backend: the spent ones would be rejected.
const sessions = new Map()
// Keyed by the session's current refresh token, so old and rotated cookies share one refresh.
const inFlight = new Map()

function isFresh(session) {
  return session.expiresAt - EXPIRY_MARGIN_MS > Date.now()
}

function forgetSession(session) {
  for (const token of session.tokens) {
    if (sessions.get(token) === session) sessions.delete(token)
  }
}

// Refreshes with `refreshToken`, replacing `previous` (the stale session it belongs to, if known) under
// all of its tokens at once. Resolves to a session, or null when the backend rejects the refresh token.
// Throws if the backend is unreachable.
async function refreshSession(refreshToken, previous) {
  const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: 'no-store',
  })
  if (res.status >= 500) throw new Error(`Refresh failed: HTTP ${res.status}`)
  if (!res.ok) {
    if (previous) forgetSession(previous)
    return null
  }

  const data = await res.json()
  const session = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    refreshToken: data.refresh_token,
    tokens: [data.refresh_token, ...(previous?.tokens ?? [refreshToken])].slice(0, MAX_TOKENS_PER_SESSION),
  }

  if (previous) forgetSession(previous)
  for (const [key, value] of sessions) {
    if (value.expiresAt <= Date.now()) sessions.delete(key)
  }
  for (const token of session.tokens) sessions.set(token, session)
  return session
}

async function resolveSession(refreshToken) {
  const known = sessions.get(refreshToken)
  if (known && isFresh(known)) return { session: known, invalid: false }

  // The cookie may hold a spent token whose rotated replacement never reached the browser;
  // refresh with the session's current token instead.
  const current = known?.refreshToken ?? refreshToken
  let pending = inFlight.get(current)
  if (!pending) {
    pending = refreshSession(current, known).finally(() => inFlight.delete(current))
    inFlight.set(current, pending)
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
