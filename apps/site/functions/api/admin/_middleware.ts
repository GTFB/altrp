/// <reference types="@cloudflare/workers-types" />

import { MeRepository } from '../../_shared/repositories/me.repository'
import { getSession, isAdmin, forbiddenResponse, unauthorizedResponse } from '../../_shared/session'
import { Env } from '../../_shared/types'
/**
 * Middleware for all /api/admin/* routes
 * Ensures only admin users can access these endpoints
 */
export const onRequest = async (context: {
  request: Request
  env: Env
  next: () => Promise<Response>
}) => {
  const { request, env, next } = context

  // Check if AUTH_SECRET is configured
  if (!env.AUTH_SECRET) {
    console.error('AUTH_SECRET not configured')
    return unauthorizedResponse('Authentication not configured')
  }

  // Get user from session
  const user = await getSession(request, env.AUTH_SECRET)
  // Check if user is authenticated
  if (!user) {
    return unauthorizedResponse()
  }

  const meRepository = MeRepository.getInstance(env.DB)
  const userWithRoles = await meRepository.findByIdWithRoles(Number(user.id), {
    includeHuman: false,
    includeEmployee: false,
  })

  // Check if user has admin role
  if (!isAdmin(userWithRoles)) {
    return forbiddenResponse()
  }

  // User is admin, proceed to the actual handler
  return next()
}

