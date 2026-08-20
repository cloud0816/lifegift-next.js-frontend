import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Legacy Auth0 route handler (kept for backward compatibility)
 * Redirects to new OAuth routes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { auth0: string[] } }
) {
  const action = params.auth0?.[0];
  const provider = params.auth0?.[1];

  // Redirect login requests to new route
  if (action === 'login' && provider) {
    return NextResponse.redirect(new URL(`/api/auth/login/${provider}`, request.url));
  }

  // Redirect logout requests
  if (action === 'logout') {
    return NextResponse.redirect(new URL('/api/auth/logout', request.url));
  }

  return NextResponse.json({ error: 'Invalid auth route' }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { auth0: string[] } }
) {
  return GET(request, { params });
}
