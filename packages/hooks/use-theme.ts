'use client'

import { useTheme as useNextTheme } from 'next-themes'
import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export function useTheme(): { theme: Theme, setTheme: (theme: Theme) => void } {
  const { theme,  setTheme  } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const _setTheme = useCallback((theme: Theme) => {
    setTheme(theme)
    fetch(`/api/state`, {
      method: 'PATCH',
      body: JSON.stringify({ theme }),
    }).catch(err => {
      console.error('Error setting theme:', err)
    })
  }, [setTheme])
  if (!mounted) {
    return { theme: 'light', setTheme: _setTheme }
  }


  return {
    theme: (theme as Theme) || 'light',
    setTheme: _setTheme,
  }
}

export function setTheme() {
  const { setTheme } = useNextTheme()
  return setTheme
}
