import { Payload } from 'payload'

export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical'

export interface LogOptions {
  level?: LogLevel
  action: string
  userId?: string | number
  details?: Record<string, any>
  xaid?: string
}

/**
 * Log activity to Journal collection
 * @param payload - Payload instance
 * @param options - Log options
 */
export async function logToJournal(payload: Payload, options: LogOptions): Promise<void> {
  const { level = 'info', action, userId, details, xaid } = options

  // Log to console
  const message = `[${level.toUpperCase()}] ${action}`
  switch (level) {
    case 'debug':
      payload.logger.debug(message)
      break
    case 'info':
      payload.logger.info(message)
      break
    case 'warning':
      payload.logger.warn(message)
      break
    case 'error':
    case 'critical':
      payload.logger.error(message)
      break
  }

  // Log to Journal database
  try {
    await payload.create({
      collection: 'journals',
      data: {
        user_id: userId ? Number(userId) : null,
        action,
        details: {
          level,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          ...details,
        },
        xaid: xaid || null,
      },
    })
  } catch (error) {
    // Silently fail if logging to database fails
    payload.logger.error('Failed to write to journal', error)
  }
}

/**
 * Log debug action
 */
export const logDebug = (payload: Payload, action: string, options?: Omit<LogOptions, 'action' | 'level'>) =>
  logToJournal(payload, { level: 'debug', action, ...options })

/**
 * Log info action
 */
export const logInfo = (payload: Payload, action: string, options?: Omit<LogOptions, 'action' | 'level'>) =>
  logToJournal(payload, { level: 'info', action, ...options })

/**
 * Log warning action
 */
export const logWarning = (payload: Payload, action: string, options?: Omit<LogOptions, 'action' | 'level'>) =>
  logToJournal(payload, { level: 'warning', action, ...options })

/**
 * Log error action
 */
export const logError = (
  payload: Payload,
  action: string,
  error?: Error,
  options?: Omit<LogOptions, 'action' | 'level'>,
) =>
  logToJournal(payload, {
    level: 'error',
    action,
    details: {
      errorName: error?.name,
      errorMessage: error?.message,
      stackTrace: error?.stack,
      ...options?.details,
    },
    ...options,
  })

/**
 * Log critical action
 */
export const logCritical = (
  payload: Payload,
  action: string,
  error?: Error,
  options?: Omit<LogOptions, 'action' | 'level'>,
) =>
  logToJournal(payload, {
    level: 'critical',
    action,
    details: {
      errorName: error?.name,
      errorMessage: error?.message,
      stackTrace: error?.stack,
      ...options?.details,
    },
    ...options,
  })

/**
 * Simple logging - just action and optional user
 */
export const log = (
  payload: Payload,
  action: string,
  userId?: string | number,
  details?: Record<string, any>,
) => logInfo(payload, action, { userId, details })
