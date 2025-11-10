/// <reference types="@cloudflare/workers-types" />

import { getSession } from '../../_shared/session'
import { Env } from '../../_shared/types'
import { MeRepository } from '../../_shared/repositories/me.repository'
/**
 * GET /api/auth/me
 * Returns current user from session and validates against database
 */
export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const { request, env } = context

  if (!env.AUTH_SECRET) {
    return new Response(JSON.stringify({ error: 'Authentication not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const sessionUser = await getSession(request, env.AUTH_SECRET)

  if (!sessionUser) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Initialize repository
    const meRepository = MeRepository.getInstance(env.DB as D1Database)

    // Get user with roles from database
    const userWithRoles = await meRepository.findByIdWithRoles(Number(sessionUser.id))

    // User not found in database
    if (!userWithRoles) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { user: dbUser, roles, human } = userWithRoles

    // User is deleted
    if (dbUser.deletedAt) {
      return new Response(JSON.stringify({ error: 'User account deleted' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // User is not active
    if (!dbUser.isActive) {
      return new Response(JSON.stringify({ error: 'User account inactive' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Determine if user is admin (has any system role)
    const isAdmin = roles.some((role) => role.isSystem === true)

    // Return current user data from database
    const user = {
      id: String(dbUser.id),
      uuid: dbUser.uuid,
      email: dbUser.email,
      name: human?.fullName || dbUser.email,
      roles: roles.map((role) => ({
        uuid: role.uuid,
        raid: role.raid,
        title: role.title,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        dataIn: role.dataIn,
      })),
    }

    return new Response(JSON.stringify({ user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Get user data error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to verify user', details: String(error) }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  })

