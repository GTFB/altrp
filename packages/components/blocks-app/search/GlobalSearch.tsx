"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { createSearchIndex, type SearchRecord } from "@/lib/search";
import { Search, X } from "lucide-react";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchRecord[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchItems, setSearchItems] = useState<SearchRecord[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    // In a real application, data loading would happen here
    setSearchItems([
      {
        id: "1",
        title: "Sample Post",
        content: "Sample content",
        tags: ["sample"],
      },
    ]);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      const searchIndex = createSearchIndex(searchItems);
      const searchResults = searchIndex.search(searchQuery, { limit: 5 });
      setResults(searchResults.map((result) => result.item));
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    }
  };

  useEffect(() => {
    handleSearch(debouncedQuery);
  }, [debouncedQuery, searchItems]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleResultClick = (result: SearchRecord) => {
    window.location.href = `/blog/${result.id}`;
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pl-10 pr-10 py-2 w-full border rounded-md bg-background"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-md shadow-lg z-50">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="w-full text-left p-3 hover:bg-muted border-b last:border-b-0"
            >
              <div className="font-medium">{result.title}</div>
              {result.content && (
                <div className="text-sm text-muted-foreground truncate">
                  {result.content}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
