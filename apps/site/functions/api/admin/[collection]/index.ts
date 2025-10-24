/// <reference types="@cloudflare/workers-types" />

import { requireAdmin, type Context, type AuthenticatedContext } from '../../../_shared/middleware'
import { COLLECTION_GROUPS } from '../../../_shared/collections'
import { generateAid } from '../../../_shared/generate-aid'

function isAllowedCollection(name: string): boolean {
  const all = Object.values(COLLECTION_GROUPS).flat()
  return all.includes(name)
}

function q(name: string): string {
  return '"' + name.replace(/"/g, '""') + '"'
}

function generateUUID(): string {
  return crypto.randomUUID()
}

async function handleGet(context: AuthenticatedContext): Promise<Response> {
  const { env, request, params } = context
  const collection = params?.collection as string

  if (!collection || !isAllowedCollection(collection)) {
    return new Response(JSON.stringify({ error: 'Invalid collection' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(request.url)
  const page = Math.max(1, Number(url.searchParams.get('p') || 1))
  const pageSize = Math.max(1, Number(url.searchParams.get('ps') || 20))

  try {
    // Detect if collection has deleted_at
    const pragma = await env.DB.prepare(`PRAGMA table_info(${collection})`).all<{ name: string }>()
    const hasDeletedAt = Boolean(pragma.results?.some((c) => c.name.toLowerCase() === 'deleted_at'))
    const where = hasDeletedAt ? `WHERE ${q('deleted_at')} IS NULL` : ''

    const count = await env.DB.prepare(`SELECT COUNT(*) as total FROM ${collection} ${where}`).first<{ total: number }>()
    const total = count?.total || 0

    const offset = (page - 1) * pageSize
    const rows = await env.DB.prepare(`SELECT * FROM ${collection} ${where} LIMIT ? OFFSET ?`).bind(pageSize, offset).all()

    return new Response(JSON.stringify({
      success: true,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      data: rows.results || [],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Query failed', details: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function handlePost(context: AuthenticatedContext): Promise<Response> {
  const { env, params, request } = context
  const collection = params?.collection as string

  if (!collection || !isAllowedCollection(collection)) {
    return new Response(JSON.stringify({ error: 'Invalid collection' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json() as Record<string, any>
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get table schema to detect auto-generated fields
    const pragma = await env.DB.prepare(`PRAGMA table_info(${collection})`).all<{
      name: string; type: string; pk: number
    }>()

    const columns = pragma.results || []
    const data: Record<string, any> = { ...body }

    // Auto-generate id, uuid, {x}aid if they exist in schema and not provided
    for (const col of columns) {
      const lowerName = col.name.toLowerCase()
      if (!data[col.name]) {
        if (lowerName === 'id' && col.pk === 1) {
          // Skip primary key id, let DB auto-increment
          continue
        }
        if (lowerName === 'uuid') {
          data[col.name] = generateUUID()
        } else if (lowerName.endsWith('aid')) {
          // Generate AID for columns like raid, haid, uaid, aid
          // Extract prefix: raid -> 'r', haid -> 'h', aid -> 'a'
          const prefix = lowerName.length === 4 ? lowerName[0] : 'a'
          data[col.name] = generateAid(prefix)
        } else if (lowerName === 'created_at' || lowerName === 'updated_at') {
          data[col.name] = new Date().toISOString()
        } else if (lowerName === 'deleted_at') {
          // Leave deleted_at as NULL for new records
          data[col.name] = null
        }
      }
    }

    const keys = Object.keys(data)
    const placeholders = keys.map(() => '?').join(', ')
    const sql = `INSERT INTO ${collection} (${keys.map(q).join(', ')}) VALUES (${placeholders})`
    const values = keys.map((k) => data[k])

    const result = await env.DB.prepare(sql).bind(...values).run()

    return new Response(JSON.stringify({ 
      success: true, 
      lastRowId: result.meta.last_row_id || null,
      generated: Object.keys(data).filter(k => !body[k]),
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Insert failed', details: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const onRequestGet = (context: Context) => requireAdmin(context, handleGet)
export const onRequestPost = (context: Context) => requireAdmin(context, handlePost)
