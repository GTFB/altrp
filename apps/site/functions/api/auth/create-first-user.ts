/// <reference types="@cloudflare/workers-types" />

import { createSession, jsonWithSession } from '../../_shared/session'
import type { Env } from '../../_shared/middleware'

interface CreateUserRequest {
  email: string
  name: string
  password: string
  confirmPassword: string
}

/**
 * POST /api/auth/create-first-user
 * Creates the first user in the system
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
    const body: CreateUserRequest = await request.json()
    const { email, name, password, confirmPassword } = body

    // Validate input
    if (!email || !name || !password || !confirmPassword) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Check password match
    if (password !== confirmPassword) {
      return new Response(
        JSON.stringify({ error: 'Passwords do not match' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if this is the first user
    const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users')
      .first<{ count: number }>()

    if ((userCount?.count || 0) > 0) {
      return new Response(
        JSON.stringify({ error: 'Users already exist. Please use the login page.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Hash password using SHA-256
    const encoder = new TextEncoder()
    const passwordData = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Generate user ID
    const userId = crypto.randomUUID()

    // Insert user into database
    await env.DB.prepare(
      'INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))'
    )
      .bind(userId, email, name, passwordHash, 'admin')
      .run()

    // Create session for the new user
    const sessionCookie = await createSession(
      {
        id: userId,
        email,
        name,
        role: 'admin',
      },
      env.AUTH_SECRET
    )

    return jsonWithSession(
      {
        success: true,
        user: {
          id: userId,
          email,
          name,
          role: 'admin',
        },
      },
      sessionCookie,
      201
    )
  } catch (error) {
    console.error('Create first user error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create user', details: String(error) }),
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


