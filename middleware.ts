import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow public access to sign-in page and auth routes
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/pages/signin') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // For now, allow all other routes (pages handle auth redirects)
  // This can be enhanced later with actual Auth0 middleware protection
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

