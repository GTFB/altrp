'use client'

import React, { useState, useEffect } from 'react'
import { highlightCode } from '../../lib/shiki-config'
import { useTheme } from '../../hooks/use-theme'

interface CodeHighlightProps {
  code: string
  language: string
  className?: string
}

export function CodeHighlight({ code, language, className = '' }: CodeHighlightProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const { theme } = useTheme()

  // Ensure code is a string
  const codeString = typeof code === 'string' ? code : String(code || '')

  useEffect(() => {
    const highlight = async () => {
      try {
        setIsLoading(true)
        const html = await highlightCode(codeString, language, theme as 'light' | 'dark')
        setHighlightedCode(html)
      } catch (error) {
        console.error('Error highlighting code:', error)
        // Fallback to plain text
        setHighlightedCode(`<pre><code>${codeString}</code></pre>`)
      } finally {
        setIsLoading(false)
      }
    }

    highlight()
  }, [codeString, language, theme])

  if (isLoading) {
    return (
      <div className={`relative my-6 rounded-lg overflow-hidden border bg-muted/50 ${className}`}>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`relative my-6 rounded-lg overflow-hidden border bg-muted/50 ${className}`}
      data-language={language}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  )
}
