import type { D1Database } from '@cloudflare/workers-types'
import { schema } from '../schema'
import type { Journal } from '../schema/types'
import BaseRepository from './BaseRepositroy'
import { stringifyJson } from './utils'

type JournalStatus = 'info' | 'success' | 'error'

export type JournalLogInput = {
  context: string
  step: string
  status?: JournalStatus
  message?: string
  payload?: unknown
  error?: unknown
  uuid?: string
  userId?: number | string | null
  xaid?: string | null
}

export class JournalsRepository extends BaseRepository<Journal> {
  private ensureTablePromise?: Promise<void>
  private d1DB: D1Database

  private constructor(db: D1Database) {
    super(schema.journals, db)
    this.d1DB = db
  }

  public static getInstance(db: D1Database): JournalsRepository {
    return new JournalsRepository(db)
  }

  private ensureTable(): Promise<void> {
    if (!this.ensureTablePromise) {
      this.ensureTablePromise = (async () => {
        await this.d1DB
          .prepare(
            `
            CREATE TABLE IF NOT EXISTS journals (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER,
              uuid TEXT NOT NULL,
              details TEXT NOT NULL,
              action TEXT NOT NULL,
              xaid TEXT,
              created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
              updated_at TEXT
            )
            `
          )
          .run()
      })()
    }
    return this.ensureTablePromise
  }

  public async log(entry: JournalLogInput): Promise<void> {
    await this.ensureTable()

    const {
      context,
      step,
      status = 'info',
      message,
      payload,
      error,
      uuid = crypto.randomUUID(),
      userId = null,
      xaid = null,
    } = entry

    const detailsString =
      stringifyJson({
        context,
        status,
        message,
        payload,
        error:
          typeof error === 'string'
            ? { message: error }
            : error,
      }) ?? '{}'

    const timestamp = new Date().toISOString()

    await this.d1DB
      .prepare(
        `INSERT INTO journals (uuid, user_id, action, details, xaid, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        uuid,
        userId,
        step,
        detailsString,
        xaid,
        timestamp,
        timestamp
      )
      .run()
  }
}

