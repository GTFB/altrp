import { eq } from "drizzle-orm";
import { schema } from "../schema";
import  BaseRepository  from "./BaseRepositroy";

export class HumanRepository extends BaseRepository{
    
    public static getInstance(db: D1Database): HumanRepository {
        return new HumanRepository(db, schema);
    }
    async findByHaid(haid: string): Promise<any | null> {
        const human = await this.db.select().from(schema.humans).where(eq(schema.humans.haid, haid)).execute()
        return human[0]
    }

}