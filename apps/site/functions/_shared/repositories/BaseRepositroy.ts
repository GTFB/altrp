import { eq, } from "drizzle-orm";
import { createDb, SiteDb } from "./utils";
import Humans from "../collections/humans";
import { schema } from "../schema";
import BaseCollection from "../collections/BaseCollection";

export default class BaseRepository<T> {
    protected db: SiteDb;
    protected d1DB: D1Database;
    constructor(db: D1Database, public schema: any) {
        this.db = createDb(db);
        this.d1DB = db;
    }
    public static getInstance(db: D1Database, schema: any): BaseRepository<any> {
        return new BaseRepository(db, schema);
    }
    async findByUuid(uuid: string): Promise<T> {
        const [row] = await this.db.select().from(this.schema).where(eq(this.schema.uuid, uuid)).execute();
        return row;
    }
    async findAll(): Promise<T[]> {
        const rows = await this.db.select().from(this.schema).execute();
        return rows;
    }
    async create(data: any): Promise<T> {
        if (!data.uuid) {
            data.uuid = crypto.randomUUID();
        }
        await this.db.insert(this.schema).values(data).execute();
        return this.findByUuid(data.uuid);
    }
    async update(uuid: string, data: any, collection: BaseCollection | null = null ): Promise<T> {

        if (!collection) {
            collection = new BaseCollection();
        }
        await collection.prepare(data);

        await this.db.update(this.schema).set(data).where(eq(this.schema.uuid, uuid)).execute();
        return this.findByUuid(uuid);
    }
}