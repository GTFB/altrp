import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

export const maxDuration = 30

/**
 * Check if database has been seeded
 * GET /next/seed/status
 */
export async function GET(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Authenticate by passing request headers
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    const result = await payload.find({
      collection: 'settings',
      where: {
        attribute: {
          equals: 'database_seeded',
        },
      },
      limit: 1,
    })

    const isSeeded = result.docs.length > 0 && result.docs[0].value === 'true'

    return Response.json({
      seeded: isSeeded,
      message: isSeeded 
        ? 'Database has been seeded' 
        : 'Database has not been seeded yet',
      timestamp: result.docs[0]?.createdAt || null,
    })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error checking seed status' })
    return new Response('Error checking seed status.', { status: 500 })
  }
}

