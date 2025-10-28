/**
 * Password hashing and verification utilities
 * Uses Web Crypto API (SHA-256)
 */

/**
 * Hash a password using SHA-256
 * @param password Plain text password
 * @returns Hashed password as hex string
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify a password against a hash
 * @param password Plain text password to verify
 * @param hash Stored password hash
 * @returns True if password matches hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * Validate password meets minimum requirements
 * @param password Password to validate
 * @returns Object with validation result and error message
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }
  
  return { valid: true }
}

/**
 * Validate password confirmation matches
 * @param password Password
 * @param confirmPassword Confirmation password
 * @returns Object with validation result and error message
 */
export function validatePasswordMatch(
  password: string, 
  confirmPassword: string
): { valid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' }
  }
  
  return { valid: true }
}

