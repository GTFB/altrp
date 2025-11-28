import type { Pool } from "pg";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle as drizzlePostgres, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { D1Database } from "@cloudflare/workers-types";
import { schema } from "../schema/schema";
import {
  SQL,
  and,
  isNull,
  notInArray,
  like,
  asc,
  desc,
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  inArray,
  between,
  notBetween,
  isNotNull,
} from "drizzle-orm";
import type { DbFilters, DbOrders } from "../types/shared";
import  postgres from "postgres";
import { isPostgres } from "../utils/db";

export type SiteDbPostgres = PostgresJsDatabase<typeof schema>;
export type SiteDbD1 = DrizzleD1Database<typeof schema>;
export type SiteDb = SiteDbD1;



function isSiteDb(db: D1Database | SiteDb | null | undefined): db is SiteDb {
  return typeof db === "object" && db !== null && "select" in db && typeof (db as SiteDb).select === "function";
}

export function createDb(db?: D1Database | SiteDb | null | undefined): SiteDb {
  if (isPostgres()) {
    // @ts-ignore
    return createDbPostgres(db);
  }
  if (isSiteDb(db)) {
    return db;
  }
  return drizzle(db as D1Database, { schema }) as SiteDb;
}
let globalConnection: postgres.Sql | undefined;

export function createDbPostgres(dbOrEnv?: any): SiteDbPostgres {
  // If we are passed a Drizzle instance, return it (though typing might be tricky if it was typed as D1)
  if (dbOrEnv && "select" in dbOrEnv) {
    return dbOrEnv as SiteDbPostgres;
  }

  // If we already have a connection, reuse it (optional optimization)
  if (!globalConnection) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not defined");
    }
    globalConnection = postgres(connectionString);
  }

  return drizzlePostgres(globalConnection, { schema }) as SiteDbPostgres;
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Failed to parse JSON from repository", error);
    return fallback;
  }
}

export function stringifyJson<T>(value: T | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error("Failed to stringify JSON from repository", error);
    return null;
  }
}

/**
 * Helper to add soft delete filter (deleted_at IS NULL)
 * Use with .where() or and()
 */
export function notDeleted(deletedAtColumn: any): SQL {
  return isNull(deletedAtColumn);
}

/**
 * Helper to combine conditions with soft delete filter
 */
export function withNotDeleted(deletedAtColumn: any, ...conditions: (SQL | undefined)[]): SQL {
  const validConditions = conditions.filter((c): c is SQL => c !== undefined);
  if (validConditions.length === 0) {
    return isNull(deletedAtColumn);
  }
  const combined = and(isNull(deletedAtColumn), ...validConditions);
  return combined ?? isNull(deletedAtColumn);
}

export function buildDbFilters(table: Record<string, any>, filters?: DbFilters): SQL | undefined {
  if (!filters || !filters.conditions || filters.conditions.length === 0) {
    return undefined;
  }

  const conditions: SQL[] = [];

  for (const condition of filters.conditions) {
    const column = table[condition.field];
    if (!column) {
      continue;
    }

    switch (condition.operator) {
      case "exclude": {
        if (!condition.values || condition.values.length === 0) {
          continue;
        }
        conditions.push(notInArray(column, condition.values));
        break;
      }
      case "like": {
        if (!condition.values || condition.values.length === 0) {
          continue;
        }
        const value = String(condition.values[0] ?? "");
        conditions.push(like(column, value));
        break;
      }
      case "in": {
        if (!condition.values || condition.values.length === 0) {
          continue;
        }
        conditions.push(inArray(column, condition.values));
        break;
      }
      case "notIn": {
        if (!condition.values || condition.values.length === 0) {
          continue;
        }
        conditions.push(notInArray(column, condition.values));
        break;
      }
      case "isNull": {
        conditions.push(isNull(column));
        break;
      }
      case "isNotNull": {
        conditions.push(isNotNull(column));
        break;
      }
      case "between": {
        if ((condition.values?.length ?? 0) < 2) {
          continue;
        }
        const [start, end] = condition.values as [any, any];
        conditions.push(between(column, start, end));
        break;
      }
      case "notBetween": {
        if ((condition.values?.length ?? 0) < 2) {
          continue;
        }
        const [start, end] = condition.values as [any, any];
        conditions.push(notBetween(column, start, end));
        break;
      }
      case "gt": {
        if (!condition.values || condition.values.length === 0) {
          continue;
        }
        conditions.push(gt(column, condition.values[0] as any));
        break;
      }
      case "gte": {
        if (!condition.values || condition.values.length === 0) {
          continue;
        }
        conditions.push(gte(column, condition.values[0] as any));
        break;
      }
      case "lt": {
        if (!condition.values || condition.values.length === 0) {
          continue;
        }
        conditions.push(lt(column, condition.values[0] as any));
        break;
      }
      case "lte": {
        if (!condition.values || condition.values.length === 0) {
          continue;
        }
        conditions.push(lte(column, condition.values[0] as any));
        break;
      }
      case "eq": {
        if (!condition.values || condition.values.length === 0) {
          continue;
        }
        conditions.push(eq(column, condition.values[0] as any));
        break;
      }
      case "neq": {
        if (!condition.values || condition.values.length === 0) {
          continue;
        }
        conditions.push(ne(column, condition.values[0] as any));
        break;
      }
      default: {
        break;
      }
    }
  }

  if (conditions.length === 0) {
    return undefined;
  }

  return conditions.length === 1 ? conditions[0] : and(...conditions);
}

export function buildDbOrders(schema: Record<string, any>, orders?: DbOrders){
  
  const orderExpressions = (orders?.orders ?? [])
  .map((order) => {
      const column = schema[order.field as keyof typeof schema];
      if (!column) {
          return undefined;
      }
      return order.direction === 'asc' ? asc(column) : desc(column);
  })
  .filter((expr): expr is ReturnType<typeof asc> => Boolean(expr));
  return (orderExpressions.length ? orderExpressions : [desc(schema.id)])
}

/**
 * Get the underlying postgres client from a Drizzle instance
 * This is needed for raw SQL queries that can't be done with Drizzle's query builder
 */
export function getPostgresClient(db: SiteDbPostgres): postgres.Sql {
  // In drizzle-orm/postgres-js, the client is stored in the internal _ property
  // We need to access it for raw queries
  return (db as any).client || (db as any)._?.client || globalConnection!;
}

/**
 * Execute a raw SQL query using the appropriate client API
 * Works with both node-postgres (Pool) and postgres-js (Sql)
 */
export async function executeRawQuery<T extends Record<string, any> = Record<string, any>>(
  client: postgres.Sql | Pool,
  sql: string,
  params: any[] = []
): Promise<T[]> {
  // Check if it's postgres-js (has unsafe method)
  if ('unsafe' in client && typeof (client as any).unsafe === 'function') {
    const result = await (client as postgres.Sql).unsafe<T[]>(sql, params);
    return Array.isArray(result) ? result : [];
  }
  
  // Otherwise it's node-postgres Pool
  const result = await (client as Pool).query<T>(sql, params);
  return result.rows || [];
}