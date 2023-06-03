import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname

    // manage route protection
    const isAuth = await getToken({ req })
    const isLoginPage = pathname.startsWith('/login')
    const sensitiveRoutes = ['/dashboard']
    const isAccessingSensitiveRoute = sensitiveRoutes.some((route) =>
      pathname.startsWith(route)
    )

    if (isLoginPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/dashboard', req.url)) // req.url = baseurl + /dashboard
      }

      return NextResponse.next() // continue to login page if user is not logged in
    }

    if (!isAuth && isAccessingSensitiveRoute) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  },
  {
    // prevent infinite redirect work-around
    callbacks: {
      async authorized() {
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/', '/login', '/dashboard/:path'],
}
