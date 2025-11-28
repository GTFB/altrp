import { eq, } from "drizzle-orm";
import { SiteDb, buildDbFilters, buildDbOrders } from "./utils";
import BaseCollection from "../collections/BaseCollection";
import type { DbFilters, DbOrders, DbPagination, DbPaginatedResult } from "../types/shared";
import { createDb, } from "./utils";
import { isPostgres } from "../utils/db";
import type { D1Database } from "@cloudflare/workers-types";


export default class BaseRepository<T> {
    protected db: SiteDb;

    constructor(public schema: any, db?: D1Database | SiteDb | null | undefined) {
        this.db = createDb(db);
    }
    protected async beforeCreate(data: Partial<T>): Promise<void> { }
    protected async afterCreate(entity: T): Promise<void> { }
    protected async beforeUpdate(uuid: string, data: Partial<T>): Promise<void> { }
    protected async afterUpdate(entity: T): Promise<void> { }
    protected async beforeDelete(uuid: string, force: boolean, entity: T): Promise<void> { }
    protected async afterDelete(uuid: string, force: boolean, entity: T): Promise<void> { }

    public static getInstance(schema: any): BaseRepository<any> {
        return new BaseRepository(schema);
    }
    public getSelectQuery() {
        return this.db.select().from(this.schema)
    }
    async findByUuid(uuid: string): Promise<T> {
        const [row] = await this.db.select().from(this.schema).where(eq(this.schema.uuid, uuid)).execute();
        return row as T;
    }
    async findById(id: number): Promise<T> {
        const [row] = await this.db.select().from(this.schema).where(eq(this.schema.id, id)).execute();
        return row as T;
    }
    async findAll(): Promise<T[]> {
        const rows = await this.db.select().from(this.schema).execute();
        return rows as T[];
    }
    async create(data: any): Promise<T> {
        if (!data.uuid) {
            data.uuid = crypto.randomUUID();
        }
        if (this.schema.createdAt) {
            data.createdAt = new Date().toISOString()
        }
        if (this.schema.updatedAt) {
            data.updatedAt = new Date().toISOString()
        }

        await this.beforeCreate(data as Partial<T>);

        let entity: T;
        if (isPostgres()) {
            const insertedRows = await this.db.insert(this.schema).values(data).returning() as T[];
            entity = insertedRows && insertedRows.length > 0 ? insertedRows[0] : (await this.findByUuid(data.uuid));
        } else {
            const result = await this.db.insert(this.schema).values(data).execute() as any;
            entity = await this.findById(result.lastInsertRowid as unknown as number);
        }

        await this.afterCreate(entity as T);
        return entity;
    }
    async update(uuid: string, data: any, collection: BaseCollection | null = null): Promise<T> {

        if (!collection) {
            collection = new BaseCollection();
        }

        if (this.schema.updatedAt) {
            data.updatedAt = new Date().toISOString()
        }
        await this.beforeUpdate(uuid, data as Partial<T>);
        await this.db.update(this.schema).set(data).where(eq(this.schema.uuid, uuid)).execute();
        const entity = await this.findByUuid(uuid);
        await this.afterUpdate(entity);
        return entity;
    }
    async deleteByUuid(uuid: string, force: boolean = false): Promise<void> {
        const entity = await this.findByUuid(uuid);
        if (!entity) {
            throw new Error('Entity not found');
        }
        await this.beforeDelete(uuid, force, entity);
        if (force) {
            await this._forceDeleteByUuid(uuid);
        } else {
            await this._softDeleteByUuid(uuid);
        }
        await this.afterDelete(uuid, force, entity);
    }
    protected async _forceDeleteByUuid(uuid: string) {
        return await this.db.delete(this.schema).where(eq(this.schema.uuid, uuid)).execute();
    }
    protected async _softDeleteByUuid(uuid: string) {

        if (this.schema.deletedAt) {
            return await this.db.update(this.schema).set({ deletedAt: new Date().toISOString() }).where(eq(this.schema.uuid, uuid)).execute();
        }

        return await this.db.delete(this.schema).where(eq(this.schema.uuid, uuid)).execute();
    }

    public async getFiltered(filters: DbFilters, orders: DbOrders, pagination: DbPagination): Promise<DbPaginatedResult<T>> {
        const query = this.getSelectQuery()
        const where = buildDbFilters(this.schema, filters)
        const order = buildDbOrders(this.schema, orders)

        const limit = Math.max(1, Math.min(pagination.limit ?? 10, 100))
        const page = Math.max(1, pagination.page ?? 1)
        const offset = (page - 1) * limit

        // Get total count
        const countQuery = this.getSelectQuery()
        const totalRows = where
            ? await countQuery.where(where).execute()
            : await countQuery.execute()
        const total = totalRows.length

        const resultQuery = where
            ? query.where(where).orderBy(...order).limit(limit).offset(offset)
            : query.orderBy(...order).limit(limit).offset(offset)
        const result = await resultQuery.execute() as T[]

        return {
            docs: result,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        }
    }
}