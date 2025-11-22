export function getBaseUrl() {
  // Client-side: use current window location but validate it's not localhost in production
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    
    // If we detect we're in a production environment but still getting localhost,
    // there might be an issue. Let's add some debugging.
    if (origin.includes('localhost') && process.env.NODE_ENV === 'production') {
      console.warn('Warning: localhost detected in production environment')
    }
    
    return origin
  }
  
  // Server-side fallback
  return 'http://localhost:3000'
}

export function getRedirectUrl() {
  const baseUrl = getBaseUrl()
  const redirectUrl = `${baseUrl}/auth/callback`
  
  // Add debugging to see what URL we're using
  console.log('Using redirect URL:', redirectUrl)
  
  return redirectUrl
}