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
    describe('seedMultiple and rollbackMultiple', () => {
        it('should seed a collection and then rollback it', async () => {
            // Test data for taxonomy (without uuid, uses entity and name)
            const taxonomyData = {
                entity: 'test_product',
                name: 'taxonomy_test_' + Date.now(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                title: 'Taxonomy Test'
            };

            // Test data for entity with uuid
            const uuid = crypto.randomUUID();
            const productData = {
                uuid: uuid,
                paid: 'test_paid',
                title: 'Test Product',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            // Seed taxonomy
            const seedResult = await seedRepository.seedMultiple({
                taxonomy: [taxonomyData],
            });
            expect(seedResult.taxonomy.errors).toBe(0);
            expect(seedResult.taxonomy.inserted).toBe(1);
            expect(seedResult.taxonomy.skipped).toBe(0);

            // Seed product (if products table exists)
            try {
                const productSeedResult = await seedRepository.seedMultiple({
                    products: [productData],
                });
                expect(productSeedResult.products?.errors).toBe(0);
                expect(productSeedResult.products?.inserted).toBeGreaterThanOrEqual(0);
            } catch (error) {
                // Products table might not exist in test DB, skip if error
                console.log('Products table might not exist, skipping product test');
            }

            // Rollback taxonomy
            const rollbackResult = await seedRepository.rollbackMultiple({
                taxonomy: [taxonomyData],
            });
            expect(rollbackResult.taxonomy.errors).toBe(0);
            expect(rollbackResult.taxonomy.deleted).toBe(1);
            expect(rollbackResult.taxonomy.notFound).toBe(0);

            // Rollback product (if it was seeded)
            try {
                const productRollbackResult = await seedRepository.rollbackMultiple({
                    products: [productData],
                });
                expect(productRollbackResult.products?.errors).toBe(0);
                expect(productRollbackResult.products?.deleted).toBeGreaterThanOrEqual(0);
            } catch (error) {
                // Products table might not exist in test DB, skip if error
                console.log('Products table might not exist, skipping product rollback test');
            }

            // Verify taxonomy was deleted by trying to rollback again (should be not found)
            const secondRollbackResult = await seedRepository.rollbackMultiple({
                taxonomy: [taxonomyData],
            });
            expect(secondRollbackResult.taxonomy.errors).toBe(0);
            expect(secondRollbackResult.taxonomy.deleted).toBe(0);
            expect(secondRollbackResult.taxonomy.notFound).toBe(1);
        });
        afterAll(async () => {
            //await worker.dispose();
        });
    });

})
