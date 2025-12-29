/**
 * Check if Auth0 is properly configured
 * Works on both server and client (client returns false for safety)
 */
export function isAuth0Configured(): boolean {
  // On client side, we can't check env vars, so return false
  if (typeof window !== 'undefined') {
    return false;
  }
  
  try {
    const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;
    
    return !!(
      issuerBaseUrl &&
      clientId &&
      clientSecret &&
      !issuerBaseUrl.includes('YOUR_AUTH0_DOMAIN') &&
      !clientId.includes('your-client-id') &&
      !clientSecret.includes('your-client-secret')
    );
  } catch {
    return false;
  }
}

/**
 * Mock user data for UI development
 */
export const MOCK_USER = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  picture: undefined, // Will use avatar fallback with initials
  sub: 'mock-user-123',
};

