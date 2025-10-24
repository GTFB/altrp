/// <reference types="@cloudflare/workers-types" />

import type { Env } from "../../_shared/middleware"
import { COLLECTION_GROUPS } from "../../_shared/collections"

interface AdminFilter {
  field: string
  op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "in"
  value: unknown
}

interface AdminState {
  collection: string
  page: number
  pageSize: number
  filters: AdminFilter[]
}

interface ColumnInfo {
  cid: number
  name: string
  type: string
  notnull: number
  dflt_value: string | null
  pk: number
}

const DEFAULT_STATE: AdminState = {
  collection: "users",
  page: 1,
  pageSize: 20,
  filters: [],
}

function q(name: string): string {
  return '"' + name.replace(/"/g, '""') + '"'
}

// Check if collection exists in COLLECTION_GROUPS
function isValidCollection(name: string): boolean {
  const all = Object.values(COLLECTION_GROUPS).flat()
  return all.includes(name)
}

function parseStateFromUrl(url: URL): AdminState {
  const collection = url.searchParams.get("c") || DEFAULT_STATE.collection
  const page = Math.max(1, Number(url.searchParams.get("p") || DEFAULT_STATE.page))
  const pageSize = Math.max(1, Number(url.searchParams.get("ps") || DEFAULT_STATE.pageSize))
  const f = url.searchParams.get("f")
  let filters: AdminFilter[] = []
  if (f) {
    try {
      const parsed = JSON.parse(f)
      if (Array.isArray(parsed)) {
        filters = parsed.filter((item) => item && typeof item.field === "string")
      }
    } catch {}
  }
  return { collection, page, pageSize, filters }
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const { request, env } = context
  const url = new URL(request.url)

  const state = parseStateFromUrl(url)

  // Validate collection
  if (!isValidCollection(state.collection)) {
    return new Response(
      JSON.stringify({ error: "Invalid collection", state }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    )
  }

  try {
    // Get table schema
    const schemaResult = await env.DB.prepare(
      `PRAGMA table_info(${state.collection})`
    ).all<ColumnInfo>()

    if (!schemaResult.results || schemaResult.results.length === 0) {
      return new Response(
        JSON.stringify({ error: "Collection not found or has no columns", state }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const columns = schemaResult.results.map((col) => ({
      name: col.name,
      type: col.type,
      nullable: col.notnull === 0,
      primary: col.pk === 1,
    }))

    const hasDeletedAt = schemaResult.results.some((c) => c.name.toLowerCase() === 'deleted_at')
    const where = hasDeletedAt ? `WHERE ${q('deleted_at')} IS NULL` : ''

    // Get total count
    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM ${state.collection} ${where}`
    ).first<{ total: number }>()

    const total = countResult?.total || 0

    // Get data with pagination
    const offset = (state.page - 1) * state.pageSize
    const dataResult = await env.DB.prepare(
      `SELECT * FROM ${state.collection} ${where} LIMIT ? OFFSET ?`
    )
      .bind(state.pageSize, offset)
      .all()

    return new Response(
      JSON.stringify({
        success: true,
        state,
        schema: {
          columns,
          total,
          totalPages: Math.ceil(total / state.pageSize),
        },
        data: dataResult.results || [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("State API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to fetch collection data",
        details: String(error),
        state,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}

export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  })
