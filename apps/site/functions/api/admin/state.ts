/// <reference types="@cloudflare/workers-types" />

import { Env } from "../../_shared/types"
import { COLLECTION_GROUPS } from "../../_shared/collections"
import { getCollection } from "../../_shared/collections/getCollection"
import qs from "qs"

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
  search: string
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
  search: "",
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
  // Parse query string with qs
  const parsed = qs.parse(url.search.slice(1))
  
  const collection = (parsed.c as string) || DEFAULT_STATE.collection
  const page = Math.max(1, Number(parsed.p) || DEFAULT_STATE.page)
  const pageSize = Math.max(1, Number(parsed.ps) || DEFAULT_STATE.pageSize)
  const search = (parsed.s as string) || DEFAULT_STATE.search
  
  let filters: AdminFilter[] = []
  if (parsed.filters && Array.isArray(parsed.filters)) {
    filters = parsed.filters.filter((item: any) => item && typeof item.field === "string") as unknown as AdminFilter[]
  }
  
  return { collection, page, pageSize, filters, search }
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
    
    // Build WHERE clause
    const whereParts: string[] = []
    const bindings: any[] = []
    
    if (hasDeletedAt) {
      whereParts.push(`${q('deleted_at')} IS NULL`)
    }
    
    // Add search condition if search is provided
    if (state.search) {
      // Get all TEXT columns for search
      const searchableColumns = columns.filter(col => col.type === 'TEXT' || col.type === 'INTEGER')
      if (searchableColumns.length > 0) {
        const searchConditions = searchableColumns.map(col => 
          `${q(col.name)} LIKE ?`
        ).join(' OR ')
        whereParts.push(`(${searchConditions})`)
        // Add search pattern for each searchable column
        searchableColumns.forEach(() => {
          bindings.push(`%${state.search}%`)
        })
      }
    }
    
    const where = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : ''

    // Get total count
    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM ${state.collection} ${where}`
    ).bind(...bindings).first<{ total: number }>()

    const total = countResult?.total || 0

    // Get data with pagination
    const offset = (state.page - 1) * state.pageSize
    const dataResult = await env.DB.prepare(
      `SELECT * FROM ${state.collection} ${where} LIMIT ? OFFSET ?`
    )
      .bind(...bindings, state.pageSize, offset)
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
        
        // Remove password fields from response
        for (const key in collectionConfig) {
          const fieldConfig = (collectionConfig as any)[key]
          if (fieldConfig?.options?.type === 'password') {
            delete processed[key]
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
