import type { D1Database } from "@cloudflare/workers-types";
import { eq } from "drizzle-orm";
import type { Base } from "../schema/types";
import { schema } from "../schema/schema";
import BaseRepository from "./BaseRepositroy";

export class BasesRepository extends BaseRepository<Base> {
  private static instance: BasesRepository | null = null;
  private constructor(db: D1Database) {
    super(db, schema.bases);
  }
  public static getInstance(db: D1Database): BasesRepository {
    if (!BasesRepository.instance) {
      BasesRepository.instance = new BasesRepository(db);
    }
    return BasesRepository.instance;
  }


  async listActive(limit = 50): Promise<Base[]> {
    return this.db
      .select()
      .from(schema.bases)
      .where(eq(schema.bases.statusName, "ACTIVE"))
      .limit(limit)
      .execute();
  }
}