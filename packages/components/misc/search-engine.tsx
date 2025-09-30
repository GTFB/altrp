'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { MDX_FILES } from '../../../settings'
import { useTranslations } from '@/hooks/use-translations'

interface SearchIndex {
  id: string
  title: string
  content: string
  section: string
  sectionId: string
  level: number
  position: number
}

interface SearchResult {
  id: string
  title: string
  content: string
  section: string
  sectionId: string
  level: number
  position: number
  relevance: number
  highlightedContent: string
}

interface SearchEngineProps {
  onResultClick: (result: SearchResult) => void
  onSectionChange?: (sectionId: string) => void
  className?: string
}

export function SearchEngine({ onResultClick, onSectionChange, className }: SearchEngineProps) {
  const t = useTranslations()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchIndex, setSearchIndex] = useState<SearchIndex[]>([])
  const [isIndexed, setIsIndexed] = useState(false)

  // Content indexing algorithm
  const indexContent = useCallback(async () => {
    try {
      setIsSearching(true)
      
      // Get all MDX files with their section names
      const mdxFiles = MDX_FILES
      
      const index: SearchIndex[] = []
      
      for (const file of mdxFiles) {
        try {
          const response = await fetch(`/api/mdx/${file.id}`)
          if (!response.ok) continue
          
          const data = await response.json()
          const content = data.content || ''
          
          // Parse headers and content
          const lines = content.split('\n')
          let currentSection = file.name
          let position = 0
          
          for (const line of lines) {
            const trimmedLine = line.trim()
            
            // Headers
            if (trimmedLine.startsWith('# ')) {
              const title = trimmedLine.substring(2)
              const id = `h1-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
              currentSection = title
              
              index.push({
                id,
                title,
                content: title,
                section: currentSection,
                sectionId: file.id,
                level: 1,
                position: position++
              })
            } else if (trimmedLine.startsWith('## ')) {
              const title = trimmedLine.substring(3)
              const id = `h2-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
              
              index.push({
                id,
                title,
                content: title,
                section: currentSection,
                sectionId: file.id,
                level: 2,
                position: position++
              })
            } else if (trimmedLine.startsWith('### ')) {
              const title = trimmedLine.substring(4)
              const id = `h3-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
              
              index.push({
                id,
                title,
                content: title,
                section: currentSection,
                sectionId: file.id,
                level: 3,
                position: position++
              })
            } else if (trimmedLine.startsWith('#### ')) {
              const title = trimmedLine.substring(5)
              const id = `h4-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
              
              index.push({
                id,
                title,
                content: title,
                section: currentSection,
                sectionId: file.id,
                level: 4,
                position: position++
              })
            } else if (trimmedLine.startsWith('##### ')) {
              const title = trimmedLine.substring(6)
              const id = `h5-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
              
              index.push({
                id,
                title,
                content: title,
                section: currentSection,
                sectionId: file.id,
                level: 5,
                position: position++
              })
            } else if (trimmedLine.startsWith('###### ')) {
              const title = trimmedLine.substring(7)
              const id = `h6-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
              
              index.push({
                id,
                title,
                content: title,
                section: currentSection,
                sectionId: file.id,
                level: 6,
                position: position++
              })
            } else if (trimmedLine && !trimmedLine.startsWith('---')) {
              // Regular content
              const words = trimmedLine.split(' ')
              if (words.length >= 3) { // Index only sentences with 3+ words
                index.push({
                  id: `content-${position}`,
                  title: words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : ''),
                  content: trimmedLine,
                  section: currentSection,
                  sectionId: file.id,
                  level: 0,
                  position: position++
                })
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to index ${file}:`, error)
        }
      }
      
      setSearchIndex(index)
      setIsIndexed(true)
    } catch (error) {
      console.error('Indexing failed:', error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Search algorithm with relevance
  const searchContent = useCallback((searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim() || !isIndexed) return []
    
    const query = searchQuery.toLowerCase().trim()
    const queryWords = query.split(/\s+/).filter(word => word.length > 2)
    
    const scoredResults: SearchResult[] = []
    
    for (const item of searchIndex) {
      let relevance = 0
      let highlightedContent = item.content
      
      // Exact match in header
      if (item.title.toLowerCase().includes(query)) {
        relevance += 100
        highlightedContent = item.title.replace(
          new RegExp(`(${query})`, 'gi'),
          '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>'
        )
      }
      
      // Match in content
      if (item.content.toLowerCase().includes(query)) {
        relevance += 50
        highlightedContent = item.content.replace(
          new RegExp(`(${query})`, 'gi'),
          '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>'
        )
      }
      
      // Word search
      for (const word of queryWords) {
        if (item.title.toLowerCase().includes(word)) {
          relevance += 20
        }
        if (item.content.toLowerCase().includes(word)) {
          relevance += 10
        }
      }
      
      // Bonus for header level (H1 > H2 > H3 > content)
      if (item.level === 1) relevance += 30
      else if (item.level === 2) relevance += 20
      else if (item.level === 3) relevance += 10
      
      if (relevance > 0) {
        scoredResults.push({
          ...item,
          relevance,
          highlightedContent
        })
      }
    }
    
    // Sort by relevance
    return scoredResults.sort((a, b) => b.relevance - a.relevance).slice(0, 10)
  }, [searchIndex, isIndexed])

  // Search handling
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
    if (searchQuery.trim()) {
      const searchResults = searchContent(searchQuery)
      setResults(searchResults)
    } else {
      setResults([])
    }
  }, [searchContent])

  // Index on mount
  useEffect(() => {
    if (!isIndexed) {
      indexContent()
    }
  }, [indexContent, isIndexed])

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Input
            placeholder={t('common.searchPlaceholder')}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => {
                setQuery('')
                setResults([])
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Indexing status */}
        {!isIndexed && (
          <div className="text-xs text-muted-foreground text-center">
            {isSearching ? t('common.indexingContent') : t('common.preparingSearch')}
          </div>
        )}

        {/* Search results */}
        {query && results.length > 0 && (
          <div className="flex flex-col h-full">
            <div className="text-xs text-muted-foreground mb-2">
              Found: {results.length} results
            </div>
            <div className="flex flex-col flex-1 gap-2 overflow-y-auto scrollbar-hide">
              {results.map((result) => (
                <Card 
                  key={result.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onResultClick(result)}
                >
                  <CardContent className="p-3 h-full flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            result.level === 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' :
                            result.level === 2 ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' :
                            result.level === 3 ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}>
                            {result.level === 1 ? 'H1' : result.level === 2 ? 'H2' : result.level === 3 ? 'H3' : 'Text'}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {result.section}
                          </span>
                          {onSectionChange && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                onSectionChange(result.sectionId)
                              }}
                            >
                              {t('common.goTo')}
                            </Button>
                          )}
                        </div>
                        <div 
                          className="text-sm font-medium mb-1"
                          dangerouslySetInnerHTML={{ __html: result.highlightedContent }}
                        />
                        <div className="text-xs text-muted-foreground">
                          {t('common.relevance')}: {result.relevance}%
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {query && results.length === 0 && isIndexed && (
          <div className="text-center text-muted-foreground py-4">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('search.nothingFound')}</p>
            <p className="text-xs">{t('search.tryDifferentKeywords')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
