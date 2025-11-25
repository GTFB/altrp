'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { MeUser } from '@/shared/types/shared'


interface MeContextValue {
  user: MeUser | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const MeContext = createContext<MeContextValue | null>(null)

interface MeProviderProps {
  children: ReactNode
  /**
   * Interval in milliseconds to refetch user data. Set to 0 or undefined to disable auto-refetch.
   * Default: undefined (no auto-refetch)
   */
  refetchInterval?: number
  /**
   * Whether to refetch when window gains focus. Default: false
   */
  refetchOnFocus?: boolean
}

export function MeProvider({ 
  children, 
  refetchInterval,
  refetchOnFocus = false,
}: MeProviderProps) {
  const [user, setUser] = useState<MeUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMe = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          setUser(null)
          setError(null)
          return
        }
        throw new Error(`Failed to fetch user: ${response.statusText}`)
      }

      const data = await response.json() as { user?: MeUser }

      if (data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user data')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  // Periodic refetch
  useEffect(() => {
    if (!refetchInterval || refetchInterval <= 0) {
      return
    }

    const intervalId = setInterval(() => {
      fetchMe()
    }, refetchInterval)

    return () => clearInterval(intervalId)
  }, [refetchInterval, fetchMe])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnFocus) {
      return
    }

    const handleFocus = () => {
      fetchMe()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnFocus, fetchMe])

  const value: MeContextValue = {
    user,
    loading,
    error,
    refetch: fetchMe,
  }

  return <MeContext.Provider value={value}>{children}</MeContext.Provider>
}

export function useMe(): MeContextValue {
  const context = useContext(MeContext)

  if (!context) {
    throw new Error('useMe must be used within MeProvider')
  }

  return context
}

