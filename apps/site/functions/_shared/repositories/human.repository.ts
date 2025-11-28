import { eq } from "drizzle-orm";
import { schema } from "../schema";
import  BaseRepository  from "./BaseRepositroy";
import { Human } from "../schema/types";
import type { D1Database } from "@cloudflare/workers-types";

export class HumanRepository extends BaseRepository<Human>{
    
    public static getInstance(db: D1Database): HumanRepository {
        return new HumanRepository(schema.humans, db);
    }
    async findByHaid(haid: string): Promise<any | null> {
        const human = await this.db.select().from(this.schema).where(eq(this.schema.haid, haid)).execute()
        return human[0]
    }

}