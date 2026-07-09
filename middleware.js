import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/callback', '/invite']

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch {
    return null
  }
}

function isAuthenticated(request) {
  const token = request.cookies.get('rg_token')?.value
  if (!token) return false
  const payload = decodeJWT(token)
  return !!payload && payload.exp * 1000 > Date.now()
}

export function middleware(request) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }

  if (!isAuthenticated(request)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|manifest.json|workbox-.*\\.js|sw.js|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
