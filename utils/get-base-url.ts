export function getBaseUrl() {
  // Client-side: just use current window location
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Development fallback for server-side
  return 'http://localhost:3000'
}

export function getRedirectUrl() {
  return `${getBaseUrl()}/auth/callback`
}