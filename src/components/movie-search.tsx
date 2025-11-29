"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "./ui/input"
import { Loader2, Search, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { searchMovies } from "@/ai/flows/ai-powered-movie-search"
import type { SearchMoviesOutput } from "@/ai/flows/ai-powered-movie-search"
import { useToast } from "@/hooks/use-toast"

export function MovieSearch() {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState<SearchMoviesOutput["results"]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [query])

  const handleSearch = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    setIsOpen(true)
    try {
      const response = await searchMovies({ query: debouncedQuery })
      setResults(response.results)
    } catch (error) {
      console.error("AI Search Error:", error)
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: "Could not fetch search results. Please try again.",
      })
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [debouncedQuery, toast])

  useEffect(() => {
    handleSearch()
  }, [handleSearch])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for movies, actors, genres..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
          {!isLoading && query && (
             <X 
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setIsOpen(false);
                }}
             />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <div className="flex flex-col">
          {isLoading && results.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
          )}
          {!isLoading && results.length === 0 && debouncedQuery && (
            <div className="p-4 text-center text-sm text-muted-foreground">No results found for "{debouncedQuery}".</div>
          )}
          {results.length > 0 && (
            <div className="max-h-80 overflow-y-auto">
              <p className="p-2 text-xs text-muted-foreground">Results for "{debouncedQuery}"</p>
              <ul>
                {results.map((result, index) => (
                  <li key={index} className="px-4 py-2 hover:bg-accent cursor-pointer text-sm">
                    {result}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
