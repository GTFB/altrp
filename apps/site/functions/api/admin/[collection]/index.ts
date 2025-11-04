/// <reference types="@cloudflare/workers-types" />

import { requireAdmin,  } from '../../../_shared/middleware'
import { Context, AuthenticatedContext } from '../../../_shared/types'
import { COLLECTION_GROUPS } from '../../../_shared/collections'
import { generateAid } from '../../../_shared/generate-aid'
import { getCollection } from '../../../_shared/collections/getCollection'
import { hashPassword, validatePassword, validatePasswordMatch } from '../../../_shared/password'

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

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validateEmailFields(collection: string, data: Record<string, any>): string | null {
  const collectionConfig = getCollection(collection)
  
  for (const [fieldName, value] of Object.entries(data)) {
    const columnConfig = (collectionConfig as any)[fieldName]
    if (columnConfig?.options?.type === 'email' && value != null && value !== '') {
      if (!isValidEmail(String(value))) {
        return `Invalid email format for field: ${fieldName}`
      }
    }
  }
  
  return null
}

async function validatePasswordFields(collection: string, data: Record<string, any>): Promise<string | null> {
  const collectionConfig = getCollection(collection)
  
  for (const [fieldName, value] of Object.entries(data)) {
    const columnConfig = (collectionConfig as any)[fieldName]
    if (columnConfig?.options?.type === 'password' && value != null && value !== '') {
      // Check password requirements
      const validation = validatePassword(String(value))
      if (!validation.valid) {
        return `${fieldName}: ${validation.error}`
      }
      
      // Check for confirmation field
      const confirmFieldName = `${fieldName}_confirm`
      const confirmValue = data[confirmFieldName]
      
      if (!confirmValue) {
        return `${fieldName}: Password confirmation is required`
      }
      
      // Check passwords match
      const matchValidation = validatePasswordMatch(String(value), String(confirmValue))
      if (!matchValidation.valid) {
        return `${fieldName}: ${matchValidation.error}`
      }
    }
  }
  
  return null
}

async function hashPasswordFields(collection: string, data: Record<string, any>): Promise<void> {
  const collectionConfig = getCollection(collection)
  
  for (const [fieldName, value] of Object.entries(data)) {
    const columnConfig = (collectionConfig as any)[fieldName]
    if (columnConfig?.options?.type === 'password' && value != null && value !== '') {
      // Hash the password
      data[fieldName] = await hashPassword(String(value))
      
      // Remove confirmation field from data (it shouldn't be saved to DB)
      delete data[`${fieldName}_confirm`]
    }
  }
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

    // Parse JSON fields based on collection config
    const collectionConfig = getCollection(collection)
    const processedData = (rows.results || []).map((row: any) => {
      const processed = { ...row }
      
      // Get column info for type checking
      const columnsInfo = pragma.results || []
      
      for (const col of columnsInfo) {
        const fieldConfig = (collectionConfig as any)[col.name]
        const isJsonField = fieldConfig?.options?.type === 'json'
        
        if (isJsonField && processed[col.name] != null) {
          try {
            const value = processed[col.name]
            if (typeof value === 'string') {
              processed[col.name] = JSON.parse(value)
            }
          } catch {
            // Not valid JSON, keep as is
            console.warn(`Failed to parse JSON field ${col.name} for collection ${collection}`)
          }
        } else if (col.type === 'TEXT' && processed[col.name]) {
          // Fallback: try parsing TEXT fields that look like JSON (for backward compatibility)
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
      
      return processed
    })

    return new Response(JSON.stringify({
      success: true,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      data: processedData,
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

    // Validate email fields
    const emailError = validateEmailFields(collection, body)
    if (emailError) {
      return new Response(JSON.stringify({ error: emailError }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate password fields
    const passwordError = await validatePasswordFields(collection, body)
    if (passwordError) {
      return new Response(JSON.stringify({ error: passwordError }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Hash password fields
    await hashPasswordFields(collection, body)

    // Process hooks and virtual fields
    const collectionConfig = getCollection(collection)
    const processedBody: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(body)) {
      const fieldConfig = (collectionConfig as any)[key]
      
      // Skip virtual fields (they don't exist in DB)
      if (fieldConfig?.options?.virtual) {
        // Execute beforeChange hook if exists
        if (fieldConfig.options.hooks?.beforeChange) {
          fieldConfig.options.hooks.beforeChange(value, body)
        }
        continue
      }
      
      // Execute beforeChange hook for non-virtual fields
      if (fieldConfig?.options?.hooks?.beforeChange) {
        processedBody[key] = fieldConfig.options.hooks.beforeChange(value, body)
      } else {
        processedBody[key] = value
      }
    }
    
    // Parse JSON fields in processedBody to objects for beforeSave hooks (especially virtual fields)
    for (const key in processedBody) {
      const fieldConfig = (collectionConfig as any)[key]
      if (fieldConfig?.options?.type === 'json' && processedBody[key] != null) {
        const value = processedBody[key]
        if (typeof value === 'string') {
          try {
            processedBody[key] = JSON.parse(value)
          } catch {
            // Not valid JSON, keep as is
          }
        }
      }
    }
    
    // Execute beforeSave hooks for all fields (including virtual ones that modify other fields)
    for (const key in collectionConfig) {
      const fieldConfig = (collectionConfig as any)[key]
      if (fieldConfig?.options?.hooks?.beforeSave) {
        const fieldValue = body[key]
        if (fieldValue !== undefined) {
          const result = fieldConfig.options.hooks.beforeSave(fieldValue, processedBody, context)
          // If beforeSave returns a value, it should modify the instance
          // Virtual fields can modify other fields in processedBody
          if (result !== undefined && !fieldConfig?.options?.virtual) {
            processedBody[key] = result
          }
        }
      }
    }

    // Get table schema to detect auto-generated fields
    const pragma = await env.DB.prepare(`PRAGMA table_info(${collection})`).all<{
      name: string; type: string; pk: number
    }>()

    const columns = pragma.results || []
    const data: Record<string, any> = { ...processedBody }
    
    // Stringify JSON fields based on collection config
    for (const col of columns) {
      const fieldConfig = (collectionConfig as any)[col.name]
      const isJsonField = fieldConfig?.options?.type === 'json'
      
      if (isJsonField && data[col.name] != null && typeof data[col.name] === 'object') {
        data[col.name] = JSON.stringify(data[col.name])
      } else if (!isJsonField && data[col.name] && typeof data[col.name] === 'object' && col.type === 'TEXT') {
        // Fallback: stringify object fields in TEXT columns (for backward compatibility)
        data[col.name] = JSON.stringify(data[col.name])
      }
    }

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
