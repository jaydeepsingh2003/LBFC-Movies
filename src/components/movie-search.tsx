"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "./ui/input"
import { Loader2, Search, X, Film, Tv } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { searchMovies } from "@/ai/flows/ai-powered-movie-search"
import { searchMovies as searchTmdbMovies, searchTvShows as searchTmdbTvShows } from "@/lib/tmdb.client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Separator } from "./ui/separator"

interface SearchResult {
  id: number;
  title: string;
  type: 'movie' | 'tv';
}

export function MovieSearch() {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

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
      const [movieResults, tvResults] = await Promise.all([
        searchTmdbMovies(debouncedQuery),
        searchTmdbTvShows(debouncedQuery),
      ]);
      
      const combinedResults: SearchResult[] = [
        ...movieResults.slice(0, 5).map(m => ({ id: m.id, title: m.title, type: 'movie' as const })),
        ...tvResults.slice(0, 5).map(tv => ({ id: tv.id, title: tv.name, type: 'tv' as const })),
      ];

      setResults(combinedResults);

    } catch (error) {
      console.error("TMDB Search Error:", error)
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
            placeholder="Search movies & TV shows..."
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
            <div className="max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <Link key={`${result.type}-${result.id}`} href={`/${result.type}/${result.id}`} passHref>
                    <div 
                      className="px-4 py-3 hover:bg-accent cursor-pointer text-sm flex items-center gap-3"
                      onClick={() => setIsOpen(false)}
                    >
                      {result.type === 'movie' ? <Film className="w-4 h-4 text-muted-foreground"/> : <Tv className="w-4 h-4 text-muted-foreground" />}
                      <span>{result.title}</span>
                    </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
