import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'statbook-secret-key')

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Skip API routes, static files, Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('statbook-token')?.value

  // Already logged in → redirect away from /login
  if (pathname.startsWith('/login')) {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, SECRET)
        const dest = roleRedirect(payload.role)
        if (dest) return NextResponse.redirect(new URL(dest, req.url))
      } catch {}
    }
    return NextResponse.next()
  }

  // All protected routes
  if (
    pathname.startsWith('/super-admin') ||
    pathname.startsWith('/hospital-admin') ||
    pathname.startsWith('/doctor') ||
    pathname.startsWith('/user') ||         // ✅ Added
    pathname.startsWith('/dashboard')
  ) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url))

    try {
      const { payload } = await jwtVerify(token, SECRET)

      // Role guards
      if (pathname.startsWith('/super-admin') && payload.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      if (pathname.startsWith('/hospital-admin') && payload.role !== 'HOSPITAL_ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      if (pathname.startsWith('/doctor') && payload.role !== 'DOCTOR') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      if (pathname.startsWith('/user') && payload.role !== 'USER') {        // ✅ Added
        return NextResponse.redirect(new URL('/login', req.url))
      }

      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

function roleRedirect(role) {
  if (role === 'SUPER_ADMIN')    return '/super-admin/dashboard'
  if (role === 'HOSPITAL_ADMIN') return '/hospital-admin/dashboard'
  if (role === 'DOCTOR')         return '/doctor/dashboard'
  if (role === 'USER')           return '/user/dashboard'   // ✅ Fixed
  return null
}

export const config = {
  matcher: [
    '/login',
    '/super-admin/:path*',
    '/hospital-admin/:path*',
    '/doctor/:path*',
    '/user/:path*',             // ✅ Added
    '/dashboard/:path*',
  ],
}
