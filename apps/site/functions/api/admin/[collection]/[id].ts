/// <reference types="@cloudflare/workers-types" />

import { requireAdmin, type Context, type AuthenticatedContext } from '../../../_shared/middleware'
import { COLLECTION_GROUPS } from '../../../_shared/collections'

function isAllowedCollection(name: string): boolean {
  const all = Object.values(COLLECTION_GROUPS).flat()
  return all.includes(name)
}

function q(name: string): string {
  return '"' + name.replace(/"/g, '""') + '"'
}

async function handleDelete(context: AuthenticatedContext): Promise<Response> {
  const { env, params } = context
  const collection = params?.collection as string
  const idParam = params?.id as string

  if (!collection || !idParam) {
    return new Response(JSON.stringify({ error: 'Missing collection or id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!isAllowedCollection(collection)) {
    return new Response(JSON.stringify({ error: 'Collection not allowed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Detect primary key column and soft-delete capability
    const pragma = await env.DB.prepare(`PRAGMA table_info(${collection})`).all<{
      name: string; pk: number
    }>()
    const pk = pragma.results?.find((c) => c.pk === 1)?.name || 'id'
    const hasDeletedAt = Boolean(pragma.results?.some((c) => c.name.toLowerCase() === 'deleted_at'))

    if (hasDeletedAt) {
      const stmt = await env.DB.prepare(`UPDATE ${collection} SET ${q('deleted_at')} = ? WHERE ${q(pk)} = ?`).bind(new Date().toISOString(), idParam).run()
      return new Response(JSON.stringify({ success: true, changes: stmt.meta.changes || 0, softDeleted: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const stmt = await env.DB.prepare(`DELETE FROM ${collection} WHERE ${q(pk)} = ?`).bind(idParam).run()

    return new Response(JSON.stringify({ success: true, changes: stmt.meta.changes || 0, softDeleted: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Delete failed', details: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function handlePut(context: AuthenticatedContext): Promise<Response> {
  const { env, params, request } = context
  const collection = params?.collection as string
  const idParam = params?.id as string

  if (!collection || !idParam) {
    return new Response(JSON.stringify({ error: 'Missing collection or id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!isAllowedCollection(collection)) {
    return new Response(JSON.stringify({ error: 'Collection not allowed' }), {
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

    const pragma = await env.DB.prepare(`PRAGMA table_info(${collection})`).all<{
      name: string; pk: number
    }>()

    const columns = pragma.results?.map((c) => c.name) || []
    const pk = pragma.results?.find((c) => c.pk === 1)?.name || 'id'
    const hasUpdatedAt = columns.some((n) => n.toLowerCase() === 'updated_at')

    // Build safe update set from provided body keys that exist in table and are not PK
    const allowedKeys = Object.keys(body).filter((k) => columns.includes(k) && k !== pk)

    const assignments: string[] = []
    const values: any[] = []
    for (const key of allowedKeys) {
      assignments.push(`${q(key)} = ?`)
      values.push(body[key])
    }

    if (hasUpdatedAt) {
      assignments.push(`${q('updated_at')} = ?`)
      values.push(new Date().toISOString())
    }

    if (assignments.length === 0) {
      return new Response(JSON.stringify({ error: 'No updatable fields provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const sql = `UPDATE ${collection} SET ${assignments.join(', ')} WHERE ${q(pk)} = ?`
    values.push(idParam)

    const result = await env.DB.prepare(sql).bind(...values).run()

    return new Response(JSON.stringify({ success: true, changes: result.meta.changes || 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Update failed', details: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const onRequestDelete = (context: Context) => requireAdmin(context, handleDelete)
export const onRequestPut = (context: Context) => requireAdmin(context, handlePut)
