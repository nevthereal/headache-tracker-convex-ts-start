// Client-side session management using sessionStorage
// Sessions are cleared when the tab is closed

const SESSION_KEY = 'headache_authenticated'

/**
 * Set authenticated session in sessionStorage (cleared on tab close)
 */
export function setSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, 'true')
  }
}

/**
 * Check if user is authenticated
 */
export function getSession(): boolean {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(SESSION_KEY) === 'true'
  }
  return false
}

/**
 * Clear authenticated session
 */
export function clearSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY)
  }
}
