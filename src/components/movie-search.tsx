"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Input } from "./ui/input"
import { Loader2, Search, X, Film, Tv, TrendingUp } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { searchMovies as searchTmdbMovies, searchTvShows as searchTmdbTvShows } from "@/lib/tmdb.client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  year?: string;
}

export function MovieSearch() {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(handler)
  }, [query])

  const handleSearch = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setResults([])
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
        ...movieResults.slice(0, 4).map(m => ({ 
            id: m.id, 
            title: m.title, 
            type: 'movie' as const,
            year: m.release_date ? new Date(m.release_date).getFullYear().toString() : undefined
        })),
        ...tvResults.slice(0, 4).map(tv => ({ 
            id: tv.id, 
            title: tv.name, 
            type: 'tv' as const,
            year: tv.first_air_date ? new Date(tv.first_air_date).getFullYear().toString() : undefined
        })),
      ];

      setResults(combinedResults);
    } catch (error) {
      console.error("Search Error:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [debouncedQuery])

  useEffect(() => {
    handleSearch()
  }, [handleSearch])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="size-full" />
          </div>
          <Input
            ref={inputRef}
            placeholder="Search..."
            className="pl-9 pr-9 h-9 bg-secondary/40 border-white/5 rounded-xl text-xs font-medium focus:ring-primary/20 focus:border-primary/50 transition-all glass-panel"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setIsOpen(true)}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
          )}
          {!isLoading && query && (
             <X 
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-white transition-colors"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setIsOpen(false);
                }}
             />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-2 glass-panel mt-2 rounded-xl shadow-2xl border-white/10"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-1">
          {isLoading && results.length === 0 && (
            <div className="p-6 text-center flex flex-col items-center gap-2">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Searching...</span>
            </div>
          )}
          {!isLoading && results.length === 0 && debouncedQuery && (
            <div className="p-6 text-center space-y-1">
                <p className="text-xs font-bold text-muted-foreground italic">"No matches found."</p>
            </div>
          )}
          {results.length > 0 && (
            <div className="max-h-[300px] overflow-y-auto no-scrollbar py-1">
              <div className="px-3 py-1.5 mb-1 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                <TrendingUp className="size-3" /> Top Matches
              </div>
              {results.map((result) => (
                <Link key={`${result.type}-${result.id}`} href={`/${result.type}/${result.id}`} onClick={() => setIsOpen(false)}>
                    <div className="px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer text-xs flex items-center justify-between group transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-secondary rounded-md group-hover:bg-primary transition-colors">
                            {result.type === 'movie' ? <Film className="size-3"/> : <Tv className="size-3" />}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{result.title}</span>
                            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter">{result.type} {result.year && `• ${result.year}`}</span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Search className="size-3 text-primary" />
                      </div>
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
