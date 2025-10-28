/// <reference types="@cloudflare/workers-types" />

import { getSession } from '../../_shared/session'
import type { Env } from '../../_shared/middleware'

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
    // Verify user still exists in database and get current data
    const dbUser = await env.DB.prepare(
      `SELECT 
        u.id, 
        u.uuid,
        u.email, 
        u.is_active,
        u.deleted_at,
        h.full_name as name,
        r.raid as role_raid,
        r.is_system as is_admin
      FROM users u
      LEFT JOIN humans h ON u.human_aid = h.haid
      LEFT JOIN user_roles ur ON u.uuid = ur.user_uuid
      LEFT JOIN roles r ON ur.role_uuid = r.uuid
      WHERE u.id = ?
      LIMIT 1`
    )
      .bind(sessionUser.id)
      .first<{
        id: number
        uuid: string
        email: string
        is_active: number
        deleted_at: string | null
        name: string | null
        role_raid: string | null
        is_admin: number | null
      }>()

    // User not found in database
    if (!dbUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // User is deleted
    if (dbUser.deleted_at) {
      return new Response(JSON.stringify({ error: 'User account deleted' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // User is not active
    if (!dbUser.is_active) {
      return new Response(JSON.stringify({ error: 'User account inactive' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Return current user data from database
    const user = {
      id: String(dbUser.id),
      email: dbUser.email,
      name: dbUser.name || dbUser.email,
      role: dbUser.is_admin ? 'admin' : 'user',
      raid: dbUser.role_raid,
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

