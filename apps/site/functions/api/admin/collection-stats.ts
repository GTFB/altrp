/// <reference types="@cloudflare/workers-types" />

import { requireAdmin, type Context, type AuthenticatedContext } from '../../_shared/middleware'

interface CollectionStats {
  name: string
  count: number
  hasDeleted?: boolean
  hasUuid?: boolean
}

/**
 * GET /api/admin/collection-stats?name=users
 * Returns statistics for a specific collection
 */
async function handleGet(context: AuthenticatedContext): Promise<Response> {
  const { request, env } = context

  try {
    const url = new URL(request.url)
    const collectionName = url.searchParams.get('name')

    if (!collectionName) {
      return new Response(
        JSON.stringify({ error: 'Collection name is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate table exists
    const tableExists = await env.DB.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`
    )
      .bind(collectionName)
      .first()

    if (!tableExists) {
      return new Response(
        JSON.stringify({ error: 'Collection not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Get total count
    const totalResult = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM "${collectionName}"`
    ).first<{ count: number }>()

    const total = totalResult?.count || 0

    // Check if table has deleted_at column
    const columns = await env.DB.prepare(
      `PRAGMA table_info("${collectionName}")`
    ).all<{ name: string; type: string }>()

    const hasDeletedAt = columns.results?.some((col) => col.name === 'deleted_at')
    const hasUuid = columns.results?.some((col) => col.name === 'uuid')

    let activeCount = total
    let deletedCount = 0

    if (hasDeletedAt) {
      const activeResult = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM "${collectionName}" WHERE deleted_at IS NULL`
      ).first<{ count: number }>()

      activeCount = activeResult?.count || 0
      deletedCount = total - activeCount
    }

    const stats: CollectionStats = {
      name: collectionName,
      count: activeCount,
      hasDeleted: hasDeletedAt,
      hasUuid,
    }

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        total,
        active: activeCount,
        deleted: deletedCount,
        columns: columns.results?.length || 0,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Get collection stats error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch collection stats', 
        details: String(error) 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

export const onRequestGet = (context: Context) =>
  requireAdmin(context, handleGet)

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

