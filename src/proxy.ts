import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-dev-only'
)

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public paths
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') // for static files like favicon.ico, images
  ) {
    return NextResponse.next()
  }

  const session = request.cookies.get('session')?.value

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await jwtVerify(session, secret)
    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
