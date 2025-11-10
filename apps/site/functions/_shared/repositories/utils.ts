import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";
import { schema } from "../schema/schema";

export type SiteDb = DrizzleD1Database<typeof schema>;


export function createDb(db: D1Database): SiteDb {
  return drizzle(db, { schema });
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

