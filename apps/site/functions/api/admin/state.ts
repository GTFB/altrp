/// <reference types="@cloudflare/workers-types" />

import type { Env } from "../../_shared/middleware"
import { COLLECTION_GROUPS } from "../../_shared/collections"
import { getCollection } from "../../_shared/collections/getCollection"

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

    // Get collection config for virtual fields
    const collectionConfig = getCollection(state.collection)
    
    const columns = schemaResult.results.map((col) => ({
      name: col.name,
      type: col.type,
      nullable: col.notnull === 0,
      primary: col.pk === 1,
    }))
    
    // Add virtual fields to schema
    const virtualFields: any[] = []
    for (const key in collectionConfig) {
      const fieldConfig = (collectionConfig as any)[key]
      if (fieldConfig?.options?.virtual && fieldConfig?.options?.value) {
        virtualFields.push({
          name: key,
          type: fieldConfig.options.type || 'TEXT',
          nullable: !fieldConfig.options.required,
          primary: false,
          virtual: true,
        })
      }
    }
    
    // Merge real and virtual columns
    const allColumns = [...columns, ...virtualFields]

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

    // Process data: parse JSON fields and compute virtual fields
    const processedData = await Promise.all(
      (dataResult.results || []).map(async (row: any) => {
        const processed = { ...row }
        
        // Parse JSON fields
        for (const col of columns) {
          if (col.type === 'TEXT' && processed[col.name]) {
            try {
              const value = processed[col.name]
              if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                processed[col.name] = JSON.parse(value)
              }
            } catch {
              // Not JSON, keep as is
            }
          }
        }
        
        // Compute virtual fields
        for (const vField of virtualFields) {
          const fieldConfig = (collectionConfig as any)[vField.name]
          if (fieldConfig?.options?.value) {
            try {
              processed[vField.name] = await fieldConfig.options.value(processed)
            } catch (error) {
              console.error(`Error computing virtual field ${vField.name}:`, error)
              processed[vField.name] = null
            }
          }
        }
        
        return processed
      })
    )

    return new Response(
      JSON.stringify({
        success: true,
        state,
        schema: {
          columns: allColumns,
          total,
          totalPages: Math.ceil(total / state.pageSize),
        },
        data: processedData,
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
