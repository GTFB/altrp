/**
 * Encrypted session management utilities for Cloudflare Workers
 * Uses Web Crypto API for encryption/decryption
 */

export interface User {
  id: string
  email: string
  name: string
  role: string
}

export interface SessionData {
  user: User
  expiresAt: number
}

const COOKIE_NAME = 'session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

/**
 * Derives encryption key from AUTH_SECRET
 */
async function getEncryptionKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const secretData = encoder.encode(secret)
  
  // Import the secret as a key
  const baseKey = await crypto.subtle.importKey(
    'raw',
    secretData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  // Derive a key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('altrp-session-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypts session data
 */
async function encrypt(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await getEncryptionKey(secret)
  
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  // Encrypt data
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  )
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedData.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encryptedData), iv.length)
  
  // Convert to base64url
  return btoa(String.fromCharCode(...combined))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Decrypts session data
 */
async function decrypt(encrypted: string, secret: string): Promise<string | null> {
  try {
    const decoder = new TextDecoder()
    const key = await getEncryptionKey(secret)
    
    // Convert from base64url
    const base64 = encrypted.replace(/-/g, '+').replace(/_/g, '/')
    const combined = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )
    
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('Decryption failed:', error)
    return null
  }
}

/**
 * Creates an encrypted session cookie
 */
export async function createSession(user: User, secret: string): Promise<string> {
  const sessionData: SessionData = {
    user,
    expiresAt: Date.now() + COOKIE_MAX_AGE * 1000,
  }
  
  const encrypted = await encrypt(JSON.stringify(sessionData), secret)
  
  return `${COOKIE_NAME}=${encrypted}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`
}

/**
 * Retrieves and validates session from cookie
 */
export async function getSession(request: Request, secret: string): Promise<User | null> {
  const cookieHeader = request.headers.get('Cookie')
  if (!cookieHeader) return null
  
  // Parse cookies
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...v] = c.trim().split('=')
      return [key, v.join('=')]
    })
  )
  
  const sessionCookie = cookies[COOKIE_NAME]
  if (!sessionCookie) return null
  
  // Decrypt session
  const decrypted = await decrypt(sessionCookie, secret)
  if (!decrypted) return null
  
  try {
    const sessionData: SessionData = JSON.parse(decrypted)
    
    // Check if expired
    if (sessionData.expiresAt < Date.now()) {
      return null
    }
    
    return sessionData.user
  } catch (error) {
    console.error('Failed to parse session:', error)
    return null
  }
}

/**
 * Clears the session cookie
 */
export function clearSession(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
}

/**
 * Checks if user has admin role
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin'
}

/**
 * Creates a JSON response with session cookie
 */
export function jsonWithSession(data: unknown, sessionCookie: string, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookie,
    },
  })
}

/**
 * Creates an unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized'): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Creates a forbidden response
 */
export function forbiddenResponse(message = 'Forbidden: Admin access required'): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  })
}

