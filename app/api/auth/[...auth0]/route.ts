import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { isAuth0Configured } from '@/lib/auth-config';

// Create Auth0 handlers only if configured
let authHandlers: ReturnType<typeof handleAuth> | null = null;

try {
  if (isAuth0Configured()) {
    authHandlers = handleAuth({
      login: handleLogin({
        returnTo: '/pages/dashboard'
      })
    });
  }
} catch (error) {
  // Auth0 not configured, will use demo mode
  console.log('Auth0 not configured, using demo mode');
}

export async function GET(request: Request) {
  if (!isAuth0Configured() || !authHandlers) {
    // Redirect to dashboard in demo mode
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    return NextResponse.redirect(new URL('/pages/dashboard', baseUrl));
  }
  
  return authHandlers(request);
}

export async function POST(request: Request) {
  if (!isAuth0Configured() || !authHandlers) {
    return NextResponse.json({ message: 'Demo mode - Auth0 not configured' }, { status: 200 });
  }
  
  return authHandlers(request);
}

