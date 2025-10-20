import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

export const maxDuration = 30

/**
 * Reset seed flag to allow re-seeding the database
 * POST /next/seed/reset
 */
export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Authenticate by passing request headers
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    // Find and delete the seed flag
    const result = await payload.find({
      collection: 'settings',
      where: {
        attribute: {
          equals: 'database_seeded',
        },
      },
      limit: 1,
    })

    if (result.docs.length > 0) {
      await payload.delete({
        collection: 'settings',
        id: result.docs[0].id,
      })
      
      payload.logger.info('Seed flag has been reset')
      return Response.json({ 
        success: true, 
        message: 'Seed flag reset successfully. You can now run seed again.' 
      })
    } else {
      payload.logger.info('No seed flag found to reset')
      return Response.json({ 
        success: true, 
        message: 'No seed flag found. Database was not marked as seeded.' 
      })
    }
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error resetting seed flag' })
    return new Response('Error resetting seed flag.', { status: 500 })
  }
}

