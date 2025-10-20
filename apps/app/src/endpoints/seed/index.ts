import type { Payload, PayloadRequest } from 'payload'
import { logInfo } from '@/utilities/logger'

const SEED_FLAG_KEY = 'database_seeded'

/**
 * Check if database has already been seeded
 */
async function isAlreadySeeded(payload: Payload): Promise<boolean> {
  try {
    const result = await payload.find({
      collection: 'settings',
      where: {
        attribute: {
          equals: SEED_FLAG_KEY,
        },
      },
      limit: 1,
    })

    return result.docs.length > 0 && result.docs[0].value === 'true'
  } catch (error) {
    payload.logger.error('Error checking seed status', error)
    return false
  }
}

/**
 * Mark database as seeded
 */
async function markAsSeeded(payload: Payload): Promise<void> {
  try {
    await payload.create({
      collection: 'settings',
      data: {
        attribute: SEED_FLAG_KEY,
        value: 'true',
        type: 'system',
      },
    })
  } catch (error) {
    payload.logger.error('Error marking database as seeded', error)
  }
}

// Seed function that does nothing but completes successfully
// This is a placeholder to prevent errors when seed endpoint is called
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  const userId = req.user?.id

  // Check if already seeded
  const alreadySeeded = await isAlreadySeeded(payload)

  if (alreadySeeded) {
    await logInfo(payload, 'Seed endpoint called - already seeded, skipped', {
      userId,
      details: {
        reason: 'Database has already been seeded',
        userEmail: req.user?.email,
      },
    })
    payload.logger.info('Database has already been seeded')
    payload.logger.info('Seed operation skipped to prevent duplicate data')
    return
  }

  await logInfo(payload, 'Seed endpoint started', {
    userId,
    details: {
      userEmail: req.user?.email,
      note: 'No operations performed - seeding is currently disabled',
    },
  })

  payload.logger.info('Seed endpoint called - no operations performed')
  payload.logger.info('Database seeding is currently disabled')
  
  // Mark as seeded so it doesn't run again
  await markAsSeeded(payload)
  

  payload.logger.info('Seed completed successfully (no changes made)')
}
