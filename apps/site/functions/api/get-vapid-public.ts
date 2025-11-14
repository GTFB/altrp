/// <reference types="@cloudflare/workers-types" />

import {  unauthorizedResponse } from '@/shared/session';
import { Env } from '@/shared/types'


export const onRequestGet = async (context: { request: Request; env: Env }) => {
    const { request, env } = context

    const vapidPublicKey = env.VAPID_PUBLIC_KEY
    if (!vapidPublicKey) {
        return unauthorizedResponse('VAPID_PUBLIC_KEY not configured')
    }
    return new Response(JSON.stringify({ vapidPublicKey }), {
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

