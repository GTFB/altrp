'use client';

import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { createSearchIndex, type SearchRecord } from '@/lib/search';
import { Search } from 'lucide-react';

interface GlobalSearchProps {
  items: SearchRecord[];
  onResultSelect?: (item: SearchRecord) => void;
}

export function GlobalSearch({ items, onResultSelect }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  const searchIndex = useMemo(() => createSearchIndex(items), [items]);
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return searchIndex.search(debouncedQuery).slice(0, 5);
  }, [searchIndex, debouncedQuery]);
  
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
        />
      </div>
      
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
          {results.map((result) => (
            <button
              key={result.item.id}
              onClick={() => onResultSelect?.(result.item)}
              className="w-full text-left px-4 py-2 hover:bg-muted focus:bg-muted focus:outline-none"
            >
              <div className="font-medium">{result.item.title}</div>
              {result.item.excerpt && (
                <div className="text-sm text-muted-foreground truncate">
                  {result.item.excerpt}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
