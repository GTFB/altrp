import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";
import { env } from "cloudflare:workers";
import { schema } from "../schema/schema";

export type SiteDb = DrizzleD1Database<typeof schema>;

export function resolveDbBinding(db?: D1Database | null): D1Database {
  if (db) {
    return db;
  }

  const bindings = env as unknown as Record<string, unknown>;
  const binding = bindings.DB;

  if (!binding) {
    throw new Error("D1 binding 'DB' is not configured in Cloudflare environment");
  }

  return binding as D1Database;
}

export function createDb(db?: D1Database | null): SiteDb {
  return drizzle(resolveDbBinding(db), { schema });
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

