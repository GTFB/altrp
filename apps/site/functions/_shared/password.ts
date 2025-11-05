/**
 * Password hashing and verification utilities
 * Uses Web Crypto API (SHA-256)
 */

/**
 * Hash a password using SHA-256
 * @param password Plain text password
 * @returns Hashed password as hex string
 */
async function _hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify a password against a hash
 * @param salt Salt used to hash the password
* @param password Plain text password to verify
 * @param hash Stored password hash
 * @returns True if password matches hash
 */
export async function verifyPassword(salt: string, password: string, hash: string): Promise<boolean> {
  const passwordHash = await _hashPassword(`${salt}:${password}`)
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

export async function preparePassword(password: string): Promise<{
  hashedPassword: string
  salt: string  
}> {
  const saltArray = crypto.getRandomValues(new Uint8Array(16))
  const salt = Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('')
  const hashedPassword = await _hashPassword(`${salt}:${password}`)
  return { hashedPassword, salt }
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

