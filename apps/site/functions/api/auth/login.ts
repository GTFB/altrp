/// <reference types="@cloudflare/workers-types" />

import { createSession, jsonWithSession } from '../../_shared/session'
import type { Env } from '../../_shared/middleware'

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

    // Query user from database
    const user = await env.DB.prepare(
      'SELECT id, email, name, password_hash, role FROM users WHERE email = ?'
    )
      .bind(email)
      .first<{
        id: string
        email: string
        name: string
        password_hash: string
        role: 'admin' | 'user'
      }>()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verify password using Web Crypto API
    const encoder = new TextEncoder()
    const passwordData = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (hashHex !== user.password_hash) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create session
    const sessionCookie = await createSession(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      env.AUTH_SECRET
    )

    return jsonWithSession(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
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

