import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Initiate OAuth login
 * Redirects to backend OAuth login endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;

  if (!provider || (provider !== 'google' && provider !== 'github')) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.lifegift.com';
  const callbackUrl = `${request.nextUrl.origin}/api/auth/callback/${provider}`;
  const loginUrl = `${apiBaseUrl}/auth/${provider}/login?redirect_uri=${encodeURIComponent(callbackUrl)}`;
  
  return NextResponse.redirect(loginUrl);
}

