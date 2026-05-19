import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve secure auth tokens from cookie jars
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const isAuthenticated = !!accessToken || !!refreshToken;

  // Protected paths matching dashboard routes
  const isDashboardRoute = pathname.startsWith('/dashboard');
  
  // Public authentication entry points
  const isAuthRoute = pathname === '/' || pathname.startsWith('/register');

  // 1. Guard check: Redirect unauthenticated operators trying to access the dashboard
  if (isDashboardRoute && !isAuthenticated) {
    console.log(`Middleware redirection: Guard blocked request to ${pathname}. Routing to /.`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Convenience check: Redirect logged-in operators away from landing/login screens straight to the app
  if (isAuthRoute && isAuthenticated) {
    console.log(`Middleware convenience: Already logged in. Routing to /dashboard.`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Map Next.js middleware paths to cover only route pages, ignoring assets/chunks/next-internals
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/register/:path*',
  ],
};
