import assert from "node:assert";
import { it, describe, beforeAll, afterAll, expect } from "bun:test";
import { unstable_startWorker,getPlatformProxy } from "wrangler";

import { SeedRepository } from '../../../functions/_shared/repositories/seed.repository';

describe('Simple Seed Repository Test', () => {

    let db: D1Database;
    let seedRepository: SeedRepository;
    let platformProxy: any;
    beforeAll(async () => {
        
        platformProxy = await getPlatformProxy({
            configPath: "wrangler.test.toml"
        });
        db = platformProxy.env.DB;
        seedRepository = SeedRepository.getInstance(db);
    });
    describe('seedMultiple', () => {
        it('should seed a collection', async () => {


            const result = await seedRepository.seedMultiple({
                taxonomy: [
                    { 
                        uuid: crypto.randomUUID(), 
                        entity: 'test_product', 
                        name: 'taxonomy test', 
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        title: 'taxonomy test'
                     },
                ]
            });
            expect(result.taxonomy.errors).toBe(0);
        });
        afterAll(async () => {
            //await worker.dispose();
        });
    });

})
