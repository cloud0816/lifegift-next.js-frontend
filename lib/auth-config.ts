/**
 * API Configuration
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.lifegift.com';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.lifegift.com';
}

