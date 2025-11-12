/// <reference types="@cloudflare/workers-types" />

import { Env } from '../../_shared/types'
import { HumanRepository } from '../repositories/human.repository'
import {
  JournalsRepository,
  type JournalLogInput,
} from '../repositories/journals.repository'

const DEFAULT_VAPID_SUBJECT = 'mailto:pl@altrp.org'
const RECORD_SIZE = 4096
const encoder = new TextEncoder()

const viewToArrayBuffer = (view: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(view.byteLength)
  new Uint8Array(buffer).set(view)
  return buffer
}

type PushLogger = (
  step: string,
  entry?: Omit<JournalLogInput, 'context' | 'step'>
) => Promise<void>

type SubscriptionKeys = {
  auth?: string
  p256dh?: string
}

export interface ServerPushSubscription {
  endpoint: string
  keys?: SubscriptionKeys
}

const normalizeEnvValue = (value?: string | null) => {
  if (!value) {
    return undefined
  }
  return value.trim()
}

const base64UrlEncode = (input: ArrayBuffer | Uint8Array): string => {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const base64UrlDecode = (input: string): Uint8Array => {
  const padded = input.padEnd(input.length + ((4 - (input.length % 4)) % 4), '=')
  const normalized = padded.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(normalized)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

const concatUint8 = (...arrays: Uint8Array[]): Uint8Array => {
  const totalLength = arrays.reduce((acc, curr) => acc + curr.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  arrays.forEach((array) => {
    result.set(array, offset)
    offset += array.length
  })
  return result
}

const toUint8 = (input: ArrayBuffer | Uint8Array): Uint8Array =>
  input instanceof Uint8Array ? input : new Uint8Array(input)

const utf8 = (value: string): Uint8Array => encoder.encode(value)

const hkdfExtract = async (salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> => {
  const key = await crypto.subtle.importKey(
    'raw',
    viewToArrayBuffer(salt),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, viewToArrayBuffer(ikm))
  return new Uint8Array(signature)
}

const hkdfExpand = async (
  prk: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> => {
  const blocks = Math.ceil(length / 32)
  let previous = new Uint8Array(0)
  const output: Uint8Array[] = []
  for (let i = 0; i < blocks; i += 1) {
    const key = await crypto.subtle.importKey(
      'raw',
      viewToArrayBuffer(prk),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const blockInput = concatUint8(previous, info, new Uint8Array([i + 1]))
    const block = new Uint8Array(
      await crypto.subtle.sign('HMAC', key, viewToArrayBuffer(blockInput))
    )
    output.push(block)
    previous = block
  }
  return concatUint8(...output).slice(0, length)
}

const hkdf = async (
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> => {
  const prk = await hkdfExtract(salt, ikm)
  return hkdfExpand(prk, info, length)
}

const lengthPrefix = (value: Uint8Array): Uint8Array => {
  const buffer = new Uint8Array(2 + value.length)
  buffer[0] = (value.length >> 8) & 0xff
  buffer[1] = value.length & 0xff
  buffer.set(value, 2)
  return buffer
}

const deriveSharedSecret = async (
  userPublicKey: Uint8Array,
  senderPrivateKey: CryptoKey
): Promise<Uint8Array> => {
  const recipientKey = await crypto.subtle.importKey(
    'raw',
    viewToArrayBuffer(userPublicKey),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: recipientKey },
    senderPrivateKey,
    256
  )
  return new Uint8Array(bits)
}

const webPushSecret = async (params: {
  authSecret: Uint8Array
  userPublicKey: Uint8Array
  senderPublicKey: Uint8Array
  sharedSecret: Uint8Array
}): Promise<Uint8Array> => {
  const context = concatUint8(
    utf8('WebPush: info\u0000'),
    params.userPublicKey,
    params.senderPublicKey
  )
  return hkdf(params.authSecret, params.sharedSecret, context, 32)
}

const deriveKeyAndNonce = async (params: {
  salt: Uint8Array
  secret: Uint8Array
}): Promise<{ key: Uint8Array; nonce: Uint8Array }> => {
  const prk = await hkdfExtract(params.salt, params.secret)
  const key = await hkdfExpand(prk, utf8('Content-Encoding: aes128gcm\u0000'), 16)
  const nonce = await hkdfExpand(prk, utf8('Content-Encoding: nonce\u0000'), 12)
  return { key, nonce }
}

const leftPad = (value: Uint8Array, length: number): Uint8Array => {
  if (value.length >= length) {
    return value.slice(value.length - length)
  }
  const output = new Uint8Array(length)
  output.set(value, length - value.length)
  return output
}

const derToJose = (signature: ArrayBuffer): Uint8Array => {
  const bytes = new Uint8Array(signature)

  if (bytes.length === 64) {
    return bytes
  }

  if (bytes.length < 8) {
    throw new Error('Invalid DER sequence for ECDSA signature')
  }

  let offset = 0
  if (bytes[offset++] !== 0x30) {
    throw new Error('Invalid DER sequence for ECDSA signature')
  }
  let length = bytes[offset++]
  if (length & 0x80) {
    const count = length & 0x7f
    length = 0
    for (let i = 0; i < count; i += 1) {
      length = (length << 8) | bytes[offset++]
    }
  }
  if (bytes[offset++] !== 0x02) {
    throw new Error('Invalid DER format: missing R component')
  }
  let rLength = bytes[offset++]
  while (bytes[offset] === 0x00 && rLength > 0) {
    offset += 1
    rLength -= 1
  }
  const r = bytes.slice(offset, offset + rLength)
  offset += rLength
  if (bytes[offset++] !== 0x02) {
    throw new Error('Invalid DER format: missing S component')
  }
  let sLength = bytes[offset++]
  while (bytes[offset] === 0x00 && sLength > 0) {
    offset += 1
    sLength -= 1
  }
  const s = bytes.slice(offset, offset + sLength)

  const result = new Uint8Array(64)
  result.set(leftPad(r, 32), 0)
  result.set(leftPad(s, 32), 32)
  return result
}

const extractXY = (publicKey: Uint8Array): { x: Uint8Array; y: Uint8Array } => {
  if (publicKey.length !== 65 || publicKey[0] !== 0x04) {
    throw new Error('Invalid uncompressed EC public key')
  }
  return {
    x: publicKey.slice(1, 33),
    y: publicKey.slice(33, 65),
  }
}

const createVapidHeaders = async (
  vapid: { subject: string; publicKey: string; privateKey: string },
  endpoint: string
): Promise<{ authorization: string }> => {
  const url = new URL(endpoint)
  const audience = `${url.protocol}//${url.host}`
  const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60

  const vapidPublicKey = base64UrlDecode(vapid.publicKey)
  const vapidPrivateKey = base64UrlDecode(vapid.privateKey)
  const { x, y } = extractXY(vapidPublicKey)

  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    d: base64UrlEncode(vapidPrivateKey),
    x: base64UrlEncode(x),
    y: base64UrlEncode(y),
  }

  const privateKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )

  const header = base64UrlEncode(utf8(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const payload = base64UrlEncode(
    utf8(
      JSON.stringify({
        aud: audience,
        exp: expiration,
        sub: vapid.subject,
      })
    )
  )
  const signingInput = `${header}.${payload}`
  const signatureDer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    viewToArrayBuffer(utf8(signingInput))
  )
  const signature = base64UrlEncode(derToJose(signatureDer))

  return {
    authorization: `WebPush ${signingInput}.${signature}`,
  }
}

const getVapidConfig = (env?: Env) => {
  const publicKey = normalizeEnvValue(env?.VAPID_PUBLIC_KEY)
  const privateKey = normalizeEnvValue(env?.VAPID_PRIVATE_KEY)
  const subject = normalizeEnvValue(env?.VAPID_SUBJECT) ?? DEFAULT_VAPID_SUBJECT

  if (!publicKey || !privateKey) {
    throw new Error(
      'VAPID keys are not configured. Please provide VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.'
    )
  }

  return {
    subject,
    publicKey,
    privateKey,
  }
}

const buildPushRequest = async (params: {
  subscription: ServerPushSubscription
  payload: string
  vapid: { subject: string; publicKey: string; privateKey: string }
  log?: PushLogger
}): Promise<{ headers: Record<string, string>; body: Uint8Array }> => {
  const { subscription, payload, vapid, log } = params
  const endpoint = subscription.endpoint
  const keys = subscription.keys ?? {}

  if (!keys.p256dh || !keys.auth) {
    throw new Error('Subscription is missing encryption keys')
  }

  await log?.('subscription_keys_ready', {
    status: 'info',
    message: 'Subscription keys available for encryption',
    payload: { endpoint },
  })

  const userPublicKey = base64UrlDecode(keys.p256dh)
  const userAuth = base64UrlDecode(keys.auth)

  if (userPublicKey.length !== 65) {
    throw new Error('Subscription p256dh key must be 65 bytes long')
  }
  if (userAuth.length < 16) {
    throw new Error('Subscription auth key must be at least 16 bytes long')
  }

  const senderKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  )
  const senderPublicKey = new Uint8Array(await crypto.subtle.exportKey('raw', senderKeyPair.publicKey))
  const sharedSecret = await deriveSharedSecret(userPublicKey, senderKeyPair.privateKey)
  const secret = await webPushSecret({
    authSecret: userAuth,
    userPublicKey,
    senderPublicKey,
    sharedSecret,
  })

  await log?.('secret_derived', {
    status: 'success',
    message: 'Derived shared secret for push encryption',
  })

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const { key: contentEncryptionKey, nonce } = await deriveKeyAndNonce({ salt, secret })

  await log?.('key_material_ready', {
    status: 'info',
    message: 'Derived content encryption key and nonce',
  })

  const payloadBytes = encoder.encode(payload)
  const record = new Uint8Array(payloadBytes.length + 1)
  record.set(payloadBytes, 0)
  record[record.length - 1] = 2

  const cek = await crypto.subtle.importKey(
    'raw',
    viewToArrayBuffer(contentEncryptionKey),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: viewToArrayBuffer(nonce) },
      cek,
      viewToArrayBuffer(record)
    )
  )

  await log?.('payload_encrypted', {
    status: 'success',
    message: 'Payload encrypted',
    payload: { payloadLength: payloadBytes.length },
  })

  const header = new Uint8Array(16 + 4 + 1 + senderPublicKey.length)
  header.set(salt, 0)
  const view = new DataView(header.buffer, header.byteOffset + 16, 4)
  view.setUint32(0, RECORD_SIZE)
  header[20] = senderPublicKey.length
  header.set(senderPublicKey, 21)

  const bodyBytes = concatUint8(header, ciphertext)

  const vapidHeaders = await createVapidHeaders(vapid, endpoint)

  const headers: Record<string, string> = {
    TTL: '60',
    'Content-Type': 'application/octet-stream',
    'Content-Encoding': 'aes128gcm',
    Encryption: `salt=${base64UrlEncode(salt)}`,
    'Crypto-Key': `dh=${base64UrlEncode(senderPublicKey)}; p256ecdsa=${vapid.publicKey}`,
    Authorization: vapidHeaders.authorization,
  }

  await log?.('request_prepared', {
    status: 'info',
    message: 'Headers and body prepared for push request',
    payload: { headers },
  })

  return { headers, body: bodyBytes }
}

export const sendPushNotification = async (
  subscription: ServerPushSubscription,
  title: string,
  body: string,
  env?: Env,
  log?: PushLogger,
  url?: string
) => {
  await log?.('vapid_config_start', {
    status: 'info',
    message: 'Resolving VAPID config',
  })

  const vapidDetails = getVapidConfig(env)

  await log?.('vapid_config_loaded', {
    status: 'success',
    message: 'VAPID config resolved',
  })

  const payload = JSON.stringify({ title, body, url })

  await log?.('payload_prepared', {
    status: 'info',
    message: 'Payload prepared',
    payload: { title, bodyLength: payload.length },
  })

  const { headers, body: requestBody } = await buildPushRequest({
    subscription,
    payload,
    vapid: vapidDetails,
    log,
  })

  await log?.('request_dispatch', {
    status: 'info',
    message: 'Sending push request',
    payload: { endpoint: subscription.endpoint },
  })

  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers,
    body: viewToArrayBuffer(requestBody),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error')
    await log?.('response_error', {
      status: 'error',
      message: 'Push request failed',
      payload: {
        endpoint: subscription.endpoint,
        status: response.status,
        statusText: response.statusText,
      },
      error: errorBody,
    })
    throw new Error(
      `Failed to deliver push notification: ${response.status} ${response.statusText} - ${errorBody}`
    )
  }

  await log?.('response_success', {
    status: 'success',
    message: 'Push request succeeded',
    payload: { endpoint: subscription.endpoint },
  })
}

export const sendPushNotificationToHuman = async (
  haid: string,
  title: string,
  body: string,
  context: { env: Env },
  url?: string
) => {
  const { env } = context
  const humanRepository = HumanRepository.getInstance(env.DB as D1Database)
  const journalsRepository = JournalsRepository.getInstance(env.DB as D1Database)

  const log: PushLogger = async (step, entry) => {
    try {
      await journalsRepository.log({
        context: `push:${haid}`,
        step,
        status: entry?.status,
        message: entry?.message,
        payload: entry?.payload,
        error: entry?.error,
      })
    } catch (logError) {
      console.error('Failed to write push journal', logError)
    }
  }

  await log('start', {
    status: 'info',
    message: 'Preparing to send push notification',
    payload: { haid, title },
  })

  const human = (await humanRepository.findByHaid(haid)) as any
  if (!human) {
    await log('human_missing', {
      status: 'error',
      message: 'Human not found',
      payload: { haid },
    })
    return
  }

  await log('human_loaded', {
    status: 'success',
    message: 'Human loaded',
    payload: { humanUuid: human.uuid },
  })

  const subscription = human.data_in?.push_subscription as ServerPushSubscription | undefined
  if (!subscription) {
    await log('subscription_missing', {
      status: 'error',
      message: 'Push subscription not found',
      payload: { haid, humanUuid: human.uuid },
    })
    return
  }

  await log('subscription_loaded', {
    status: 'success',
    message: 'Subscription retrieved',
    payload: { endpoint: subscription.endpoint },
  })

  try {
    await sendPushNotification(subscription, title, body, env, log, url)
    await log('completed', {
      status: 'success',
      message: 'Push notification sent successfully',
      payload: { endpoint: subscription.endpoint },
    })
  } catch (error) {
    await log('failed', {
      status: 'error',
      message: 'Push notification failed',
      payload: { endpoint: subscription.endpoint },
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    })
    throw error
  }
}
