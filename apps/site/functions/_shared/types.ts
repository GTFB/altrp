/// <reference types="@cloudflare/workers-types" />

export interface Env {
    AUTH_SECRET: string
    DB: D1Database
    [key: string]: any
}

export interface Context {
    request: Request
    env: Env
    params?: Record<string, string>
}

export interface User {
    id: string
    email: string
    name: string
    role: string
}

export interface SessionData {
    user: User
    expiresAt: number
}

export interface AuthenticatedContext extends Context {
    user: User
}

export interface CollectionStats {
    name: string
    count: number
    hasDeleted?: boolean
    hasUuid?: boolean
  }