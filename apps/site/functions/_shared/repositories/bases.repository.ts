import type { D1Database } from "@cloudflare/workers-types";
import { eq } from "drizzle-orm";
import type { Base } from "../schema/types";
import { schema } from "../schema/schema";
import { createDb, type SiteDb } from "./utils";

export class BasesRepository {
  private db: SiteDb;
  private static instance: BasesRepository | null = null;
  private constructor(db: D1Database | null = null) {
    this.db = createDb(db);
  }
  public static getInstance(db: D1Database | null = null): BasesRepository {
    if (!BasesRepository.instance) {
      BasesRepository.instance = new BasesRepository(db);
    }
    return BasesRepository.instance;
  }

  async findByUuid(uuid: string): Promise<Base | undefined> {
    const [base] = await this.db
      .select()
      .from(schema.bases)
      .where(eq(schema.bases.uuid, uuid))
      .limit(1);

    return base;
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