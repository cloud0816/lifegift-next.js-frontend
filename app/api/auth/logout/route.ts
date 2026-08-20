import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Logout handler
 * Calls backend logout API and clears session cookie
 */
export async function POST(request: NextRequest) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.lifegift.com';
  
  try {
    // Call logout API with session cookie
    await fetch(`${apiBaseUrl}/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });
  } catch (error) {
    // Continue even if API call fails
    console.error('Logout API error:', error);
  }
  
  // Clear session cookie and redirect
  const response = NextResponse.redirect(new URL('/pages/signin', request.url));
  response.cookies.delete('session');
  
  return response;
}

export async function GET(request: NextRequest) {
  return POST(request);
}

