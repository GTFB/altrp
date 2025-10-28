/// <reference types="@cloudflare/workers-types" />

import { createSession, jsonWithSession } from '../../_shared/session'
import type { Env } from '../../_shared/middleware'
import { verifyPassword } from '../../_shared/password'

interface LoginRequest {
  email: string
  password: string
}

/**
 * POST /api/auth/login
 * Authenticates user and creates encrypted session cookie
 */
export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context

  if (!env.AUTH_SECRET) {
    return new Response(JSON.stringify({ error: 'Authentication not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body: LoginRequest = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Query user from database with human and role information
    const user = await env.DB.prepare(
      `SELECT 
        u.id, 
        u.uuid,
        u.email, 
        u.password_hash,
        h.full_name as name,
        r.raid as role,
        r.is_system as is_admin
      FROM users u
      LEFT JOIN humans h ON u.human_aid = h.haid
      LEFT JOIN user_roles ur ON u.uuid = ur.user_uuid
      LEFT JOIN roles r ON ur.role_uuid = r.uuid
      WHERE u.email = ?
      LIMIT 1`
    )
      .bind(email)
      .first<{
        id: number
        uuid: string
        email: string
        name: string | null
        password_hash: string
        role: string | null
        is_admin: number | null
      }>()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create session
    const sessionCookie = await createSession(
      {
        id: String(user.id),
        email: user.email,
        name: user.name || email,
        role: user.is_admin ? 'admin' : 'user',
      },
      env.AUTH_SECRET
    )

    return jsonWithSession(
      {
        success: true,
        user: {
          id: user.id,
          uuid: user.uuid,
          email: user.email,
          name: user.name || email,
          role: user.is_admin ? 'admin' : 'user',
          raid: user.role,
        },
      },
      sessionCookie
    )
  } catch (error) {
    console.error('Login error:', error)
    return new Response(
      JSON.stringify({ error: 'Login failed', details: String(error) }),
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  })

