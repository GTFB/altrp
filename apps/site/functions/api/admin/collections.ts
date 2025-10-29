/// <reference types="@cloudflare/workers-types" />

import { requireAdmin, } from '../../_shared/middleware'
import { Context, AuthenticatedContext } from '../../_shared/types'
import { COLLECTION_GROUPS } from '../../_shared/collections'

interface TableInfo {
  name: string
  type: string
}

interface CollectionGroup {
  category: string
  collections: string[]
}

/**
 * GET /api/admin/collections
 * Returns list of all collections grouped by category
 */
async function handleGet(context: AuthenticatedContext): Promise<Response> {
  const { env } = context

  try {
    // Get all tables from database
    const tables = await env.DB.prepare(
      `SELECT name, type FROM sqlite_master 
       WHERE type='table' 
       AND name NOT LIKE 'sqlite_%' 
       AND name NOT LIKE 'd1_%'
       AND name NOT LIKE '_migrations'
       ORDER BY name`
    ).all<TableInfo>()

    if (!tables.results) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tables' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Group collections
    const grouped: CollectionGroup[] = []
    const tableNames = new Set(tables.results.map((t) => t.name))

    // Group known collections
    for (const [category, collections] of Object.entries(COLLECTION_GROUPS)) {
      const found = collections.filter((name) => tableNames.has(name))
      if (found.length > 0) {
        grouped.push({
          category,
          collections: found,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: tables.results.length,
        groups: grouped,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Get collections error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch collections', 
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

