/**
 * Middleware utilities for Cloudflare Pages Functions
 */

import { getSession, isAdmin, forbiddenResponse, unauthorizedResponse,  } from './session'
import { Context, AuthenticatedContext } from './types'

/**
 * Middleware to require authentication
 */
export async function requireAuth(
  context: Context,
  next: (context: AuthenticatedContext) => Promise<Response>
): Promise<Response> {
  const { request, env } = context
  
  if (!env.AUTH_SECRET) {
    console.error('AUTH_SECRET not configured')
    return unauthorizedResponse('Authentication not configured')
  }
  
  const user = await getSession(request, env.AUTH_SECRET)
  
  if (!user) {
    return unauthorizedResponse()
  }
  
  return next({ ...context, user })
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(
  context: Context,
  next: (context: AuthenticatedContext) => Promise<Response>
): Promise<Response> {
  const { request, env } = context
  
  if (!env.AUTH_SECRET) {
    console.error('AUTH_SECRET not configured')
    return unauthorizedResponse('Authentication not configured')
  }
  
  const user = await getSession(request, env.AUTH_SECRET)
  
  if (!user) {
    return unauthorizedResponse()
  }
  
  if (!isAdmin(user)) {
    return forbiddenResponse()
  }
  
  return next({ ...context, user })
}

/**
 * Helper to wrap handler with middleware
 */
export function withMiddleware<T extends Context>(
  middleware: (context: Context, next: (context: T) => Promise<Response>) => Promise<Response>,
  handler: (context: T) => Promise<Response>
) {
  return (context: Context) => middleware(context, handler as (context: T) => Promise<Response>)
}

