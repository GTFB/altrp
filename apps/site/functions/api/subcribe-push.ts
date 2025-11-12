/// <reference types="@cloudflare/workers-types" />

import { MeRepository } from '@/shared/repositories/me.repository';
import { getSession, unauthorizedResponse } from '@/shared/session';
import { Env } from '@/shared/types'
import { PushSubscription } from 'web-push'
import { HumanRepository } from '@/shared/repositories/human.repository';

export const onRequestPost = async (context: { request: Request; env: Env }) => {

    const { request, env } = context


    if (!env.AUTH_SECRET) {
        console.error('AUTH_SECRET not configured')
        return unauthorizedResponse('Authentication not configured')
    }

    // Get user from session
    const user = await getSession(request, env.AUTH_SECRET)

    if (!user || !user.id) {
        return unauthorizedResponse('User not found')
    }

    const {subscription} = await request.json() as {subscription: PushSubscription}

    const meRepository = MeRepository.getInstance(env.DB as D1Database)

    const userWithRoles = await meRepository.findByIdWithRoles(Number(user.id))

    if(!userWithRoles?.human) {
        return unauthorizedResponse('Human not found')
    }

    const humanRepository = HumanRepository.getInstance(env.DB as D1Database)

    const dataIn = userWithRoles.human.dataIn || {} as any

    const uuid = userWithRoles.human.uuid
    dataIn.push_subscription = subscription

    await humanRepository.update(uuid, userWithRoles.human)

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
    })
}
export const onRequestOptions = async () =>
    new Response(null, {
        status: 204,
        headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "POST, OPTIONS",
            "access-control-allow-headers": "content-type",
        },
    })

