import { eq, and } from 'drizzle-orm'
import type { D1Database } from '@cloudflare/workers-types'
import { schema } from '../schema'
import { createDb, stringifyJson, type SiteDb } from './utils'

type SeedRecord = Record<string, unknown> & { uuid: string }

export type SeedResult = {
  inserted: number
  skipped: number
  errors: number
}

export class SeedRepository {
  private static instance: SeedRepository | null = null
  private readonly db: SiteDb

  private constructor(db: D1Database) {
    this.db = createDb(db)
  }

  public static getInstance(db: D1Database): SeedRepository {
    if (!SeedRepository.instance) {
      SeedRepository.instance = new SeedRepository(db)
    }
    return SeedRepository.instance
  }

  /**
   * Seeds data for a specific collection
   */
  async seedCollection(
    collectionName: string,
    records: SeedRecord[]
  ): Promise<SeedResult> {
    const result: SeedResult = { inserted: 0, skipped: 0, errors: 0 }

    // Map collection name to schema table
    const table = (schema as Record<string, unknown>)[collectionName]
    if (!table) {
      console.warn(`Collection '${collectionName}' not found in schema`)
      result.errors = records.length
      return result
    }

    // Process each record
    for (const record of records) {
      try {
        // Determine existence condition
        let existing: any[] = []
        if (collectionName === 'taxonomy' && !(table as any).uuid) {
          const entity = (record as any).entity
          const name = (record as any).name
          if (!entity || !name) {
            console.warn(`Record in 'taxonomy' missing entity or name, skipping`)
            result.errors++
            continue
          }
          existing = await this.db
            .select()
            .from(table as any)
            .where(and(eq((table as any).entity, entity), eq((table as any).name, name)))
            .limit(1)
        } else {
          const uuid = record.uuid
          if (!uuid) {
            console.warn(`Record in '${collectionName}' missing uuid, skipping`)
            result.errors++
            continue
          }
          existing = await this.db
            .select()
            .from(table as any)
            .where(eq((table as any).uuid, uuid))
            .limit(1)
        }

        if (existing.length > 0) {
          result.skipped++
          continue
        }

        // Prepare record for insertion
        let preparedRecord = this.prepareRecord(record)
        if (collectionName === 'taxonomy' && !(table as any).uuid) {
          // Remove uuid if provided in seed to avoid unknown column insert
          const { uuid: _omit, ...rest } = preparedRecord as any
          preparedRecord = rest
        }

        // Insert record
        await this.db.insert(table as any).values(preparedRecord)
        result.inserted++
      } catch (error) {
        console.error(
          `Error inserting record into '${collectionName}':`,
          error,
          record
        )
        result.errors++
      }
    }

    return result
  }

  /**
   * Seeds multiple collections from data object
   */
  async seedMultiple(
    data: Record<string, SeedRecord[]>
  ): Promise<Record<string, SeedResult>> {
    const results: Record<string, SeedResult> = {}

    for (const [collectionName, records] of Object.entries(data)) {
      results[collectionName] = await this.seedCollection(collectionName, records)
    }

    return results
  }

  /**
   * Checks if a record exists by uuid
   */
  async exists(collectionName: string, uuid: string): Promise<boolean> {
    const table = (schema as Record<string, unknown>)[collectionName]
    if (!table) {
      return false
    }

    const existing = await this.db
      .select()
      .from(table as any)
      .where(eq((table as any).uuid, uuid))
      .limit(1)

    return existing.length > 0
  }

  /**
   * Prepares a record for database insertion
   * Converts snake_case to camelCase and handles special fields
   */
  private prepareRecord(record: SeedRecord): Record<string, unknown> {
    const prepared: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(record)) {
      // Convert snake_case to camelCase
      const camelKey = this.snakeToCamel(key)

      // Handle JSON fields
      if (camelKey === 'dataIn' || camelKey === 'dataOut') {
        prepared[camelKey] = typeof value === 'string' ? value : stringifyJson(value)
      }
      // Handle boolean fields
      else if (camelKey === 'isSystem' || camelKey === 'isActive' || camelKey === 'kit') {
        prepared[camelKey] = value ? 1 : 0
      }
      // Regular fields
      else {
        prepared[camelKey] = value
      }
    }

    return prepared
  }

  /**
   * Converts snake_case to camelCase
   */
  private snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  }
}

