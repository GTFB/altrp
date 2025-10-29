/// <reference types="@cloudflare/workers-types" />

import { Env } from '../../_shared/types'
/**
 * GET /api/auth/check-users
 * Checks if any users exist in the database
 */
export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const { env } = context

  try {
    const result = await env.DB.prepare('SELECT COUNT(*) as count FROM users')
      .first<{ count: number }>()

    const hasUsers = (result?.count || 0) > 0

    return new Response(
      JSON.stringify({ hasUsers, count: result?.count || 0 }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Check users error:', error)
    return new Response(
      JSON.stringify({ error: 'Database error', details: String(error) }),
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
    },
  })


