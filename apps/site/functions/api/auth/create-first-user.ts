/// <reference types="@cloudflare/workers-types" />

import { createSession, jsonWithSession } from '../../_shared/session'
import type { Env } from '../../_shared/middleware'
import { generateAid } from '../../_shared/generate-aid'
import { hashPassword, validatePassword, validatePasswordMatch } from '../../_shared/password'

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

    // Validate password requirements
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return new Response(
        JSON.stringify({ error: passwordValidation.error }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Check password match
    const matchValidation = validatePasswordMatch(password, confirmPassword)
    if (!matchValidation.valid) {
      return new Response(
        JSON.stringify({ error: matchValidation.error }),
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

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate UUIDs and AIDs
    const userUuid = crypto.randomUUID()
    const humanUuid = crypto.randomUUID()
    const humanAid = generateAid('h')
    
    // Create Human first
    await env.DB.prepare(
      `INSERT INTO humans (uuid, haid, full_name, email, created_at, updated_at) 
       VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`
    )
      .bind(humanUuid, humanAid, name, email)
      .run()

    // Check if admin role exists, if not create it
    let adminRole = await env.DB.prepare(
      `SELECT uuid, raid FROM roles WHERE raid LIKE 'r-%' AND is_system = 1 LIMIT 1`
    ).first<{ uuid: string; raid: string }>()

    if (!adminRole) {
      const roleUuid = crypto.randomUUID()
      const roleAid = generateAid('r')
      
      await env.DB.prepare(
        `INSERT INTO roles (uuid, raid, name, title, is_system, "order", created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`
      )
        .bind(
          roleUuid, 
          roleAid,
          'Administrator',
          'Administrator', 
          1, 
          0
        )
        .run()
      
      adminRole = { uuid: roleUuid, raid: roleAid }
    }

    // Insert user into database
    await env.DB.prepare(
      `INSERT INTO users (uuid, human_aid, email, password_hash, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`
    )
      .bind(userUuid, humanAid, email, passwordHash, 1)
      .run()

    // Create user_role relationship
    await env.DB.prepare(
      `INSERT INTO user_roles (user_uuid, role_uuid, "order", created_at, updated_at) 
       VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`
    )
      .bind(userUuid, adminRole.uuid, 0)
      .run()

    // Get the user ID for session
    const createdUser = await env.DB.prepare(
      'SELECT id FROM users WHERE uuid = ? LIMIT 1'
    )
      .bind(userUuid)
      .first<{ id: number }>()

    if (!createdUser) {
      throw new Error('Failed to retrieve created user')
    }

    // Create session for the new user
    const sessionCookie = await createSession(
      {
        id: String(createdUser.id),
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
          id: createdUser.id,
          uuid: userUuid,
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


