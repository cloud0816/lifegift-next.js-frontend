import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * OAuth callback handler
 * The backend API handles the OAuth callback and redirects here with a session cookie.
 * This route just redirects to the dashboard.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;

  if (!provider || (provider !== 'google' && provider !== 'github')) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  // The backend API has already processed the OAuth callback
  // and set the session cookie via Set-Cookie header.
  // Just redirect to dashboard.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  return NextResponse.redirect(new URL('/pages/dashboard', baseUrl));
}

