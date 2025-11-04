/// <reference types="@cloudflare/workers-types" />

import { requireAdmin, } from '../../../_shared/middleware'
import { Context, AuthenticatedContext } from '../../../_shared/types'
import { COLLECTION_GROUPS } from '../../../_shared/collections'
import { getCollection } from '../../../_shared/collections/getCollection'
import { hashPassword, validatePassword, validatePasswordMatch } from '../../../_shared/password'

function isAllowedCollection(name: string): boolean {
  const all = Object.values(COLLECTION_GROUPS).flat()
  return all.includes(name)
}

function q(name: string): string {
  return '"' + name.replace(/"/g, '""') + '"'
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

async function validatePasswordFields(collection: string, data: Record<string, any>, isUpdate: boolean = false): Promise<string | null> {
  const collectionConfig = getCollection(collection)
  
  for (const [fieldName, value] of Object.entries(data)) {
    const columnConfig = (collectionConfig as any)[fieldName]
    if (columnConfig?.options?.type === 'password') {
      // For updates: if password is empty, skip validation (user doesn't want to change it)
      if (isUpdate && (value == null || value === '')) {
        continue
      }
      
      // For creates or non-empty updates: validate
      if (value != null && value !== '') {
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
  }
  
  return null
}

async function hashPasswordFields(collection: string, data: Record<string, any>, isUpdate: boolean = false): Promise<void> {
  const collectionConfig = getCollection(collection)
  
  for (const [fieldName, value] of Object.entries(data)) {
    const columnConfig = (collectionConfig as any)[fieldName]
    if (columnConfig?.options?.type === 'password') {
      // For updates: if password is empty, remove it from data (don't update)
      if (isUpdate && (value == null || value === '')) {
        delete data[fieldName]
        delete data[`${fieldName}_confirm`]
        continue
      }
      
      // Hash the password if it's provided
      if (value != null && value !== '') {
        data[fieldName] = await hashPassword(String(value))
        // Remove confirmation field from data (it shouldn't be saved to DB)
        delete data[`${fieldName}_confirm`]
      }
    }
  }
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
      name: string; pk: number; type: string
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

    // Validate email fields
    const emailError = validateEmailFields(collection, body)
    if (emailError) {
      return new Response(JSON.stringify({ error: emailError }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate password fields (for update mode)
    const passwordError = await validatePasswordFields(collection, body, true)
    if (passwordError) {
      return new Response(JSON.stringify({ error: passwordError }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Hash password fields (for update mode)
    await hashPasswordFields(collection, body, true)

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

    const pragma = await env.DB.prepare(`PRAGMA table_info(${collection})`).all<{
      name: string; pk: number; type: string
    }>()

    const columnsInfo = pragma.results || []
    const columns = columnsInfo.map((c) => c.name)
    const pk = pragma.results?.find((c) => c.pk === 1)?.name || 'id'
    const hasUpdatedAt = columns.some((n) => n.toLowerCase() === 'updated_at')

    // Build safe update set from provided body keys that exist in table and are not PK
    const allowedKeys = Object.keys(processedBody).filter((k) => columns.includes(k) && k !== pk)

    const assignments: string[] = []
    const values: any[] = []
    for (const key of allowedKeys) {
      assignments.push(`${q(key)} = ?`)
      let value = processedBody[key]
      
      // Stringify JSON fields based on collection config
      const fieldConfig = (collectionConfig as any)[key]
      const isJsonField = fieldConfig?.options?.type === 'json'
      const colInfo = columnsInfo.find(c => c.name === key)
      
      if (isJsonField && value != null && typeof value === 'object') {
        value = JSON.stringify(value)
      } else if (!isJsonField && value && typeof value === 'object' && colInfo?.type === 'TEXT') {
        // Fallback: stringify object fields in TEXT columns (for backward compatibility)
        value = JSON.stringify(value)
      }
      
      values.push(value)
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
