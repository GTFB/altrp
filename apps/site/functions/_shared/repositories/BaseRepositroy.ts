import { eq, } from "drizzle-orm";
import { createDb, SiteDb } from "./utils";
import BaseCollection from "../collections/BaseCollection";

export default class BaseRepository<T> {
    protected db: SiteDb;
    protected d1DB: D1Database;
    constructor(db: D1Database, public schema: any) {
        this.db = createDb(db);
        this.d1DB = db;
    }
    protected async beforeCreate(data: Partial<T>): Promise<void> {}
    protected async afterCreate(entity: T): Promise<void> {}
    protected async beforeUpdate(uuid: string, data: Partial<T>): Promise<void> {}
    protected async afterUpdate(entity: T): Promise<void> {}
    protected async beforeDelete(uuid: string, force: boolean): Promise<void> {}
    protected async afterDelete(uuid: string, force: boolean): Promise<void> {}
    
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
        if(this.schema.createdAt){
            data.createdAt = new Date().toISOString()
        }
        if(this.schema.updatedAt){
            data.updatedAt = new Date().toISOString()
        }
        await this.beforeCreate(data as Partial<T>);
        await this.db.insert(this.schema).values(data).execute();
        const entity = await this.findByUuid(data.uuid);
        await this.afterCreate(entity);
        return entity;
    }
    async update(uuid: string, data: any, collection: BaseCollection | null = null ): Promise<T> {

        if (!collection) {
            collection = new BaseCollection();
        }

        if(this.schema.updatedAt){
            data.updatedAt = new Date().toISOString()
        }
        await this.beforeUpdate(uuid, data as Partial<T>);
        await this.db.update(this.schema).set(data).where(eq(this.schema.uuid, uuid)).execute();
        const entity = await this.findByUuid(uuid);
        await this.afterUpdate(entity);
        return entity;
    }
    async deleteByUuid(uuid: string, force: boolean= false): Promise<D1Result> {
        await this.beforeDelete(uuid, force);
        const result = force ? await this._forceDeleteByUuid(uuid) : await this._softDeleteByUuid(uuid);
        await this.afterDelete(uuid, force);
        return result;
    }
    protected async _forceDeleteByUuid(uuid: string){
        return await this.db.delete(this.schema).where(eq(this.schema.uuid, uuid)).execute();
    }
    protected async _softDeleteByUuid(uuid: string){

        if(this.schema.deletedAt){
            return await this.db.update(this.schema).set({ deletedAt: new Date().toISOString() }).where(eq(this.schema.uuid, uuid)).execute();
        }

       return await this.db.delete(this.schema).where(eq(this.schema.uuid, uuid)).execute();
    }
}