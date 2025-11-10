import { eq, } from "drizzle-orm";
import { createDb, SiteDb } from "./utils";

export default class BaseRepository {
    protected db: SiteDb;
    constructor(db: D1Database, public schema: any) {
        this.db = createDb(db);

    }
    async findByUuid(uuid: string): Promise<any> {
        const [row] = await this.db.select().from(this.schema).where(eq(this.schema.uuid, uuid)).execute();
        return row;
    }
    async findAll(): Promise<any[]> {
        const rows = await this.db.select().from(this.schema).execute();
        return rows;
    }
    async create(data: any): Promise<any> {
        await this.db.insert(this.schema).values(data).execute();
        return this.findByUuid(data.uuid);
    }
    async update(uuid: string, data: any): Promise<any> {
        await this.db.update(this.schema).set(data).where(eq(this.schema.uuid, uuid)).execute();
        return this.findByUuid(uuid);
    }
}