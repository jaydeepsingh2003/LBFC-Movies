'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';

const movieGenres = [
  { id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 16, name: "Animation" }, 
  { id: 35, name: "Comedy" }, { id: 80, name: "Crime" }, { id: 99, name: "Documentary" }, 
  { id: 18, name: "Drama" }, { id: 10751, name: "Family" }, { id: 14, name: "Fantasy" }, 
  { id: 36, name: "History" }, { id: 27, name: "Horror" }, { id: 10402, name: "Music" }, 
  { id: 9648, name: "Mystery" }, { id: 10749, name: "Romance" }, { id: 878, name: "Science Fiction" }, 
  { id: 10770, name: "TV Movie" }, { id: 53, name: "Thriller" }, { id: 10752, name: "War" }, 
  { id: 37, name: "Western" }
];

const tvGenres = [
  { id: 10759, name: "Action & Adventure" }, { id: 16, name: "Animation" }, { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" }, { id: 99, name: "Documentary" }, { id: 18, name: "Drama" },
  { id: 10751, name: "Family" }, { id: 10762, name: "Kids" }, { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" }, { id: 10764, name: "Reality" }, { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" }, { id: 10767, name: "Talk" }, { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" }
];

const currentYear = new Date().getFullYear();

export interface FilterState {
  genre: string;
  releaseYear: [number];
  keywords: string;
  rating: [number, number];
}

interface DiscoverFiltersProps {
  onSearch: (filters: FilterState) => void;
  isLoading: boolean;
  searchType: 'movie' | 'tv';
}

export default function DiscoverFilters({ onSearch, isLoading, searchType }: DiscoverFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    genre: '',
    releaseYear: [currentYear],
    keywords: '',
    rating: [5, 10],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (value: string) => {
    setFilters(prev => ({ ...prev, genre: value === 'any' ? '' : value }));
  };

  const handleYearChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, releaseYear: value as [number] }));
  };

  const handleRatingChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, rating: value as [number, number] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const genres = searchType === 'movie' ? movieGenres : tvGenres;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-2 text-primary mb-2">
        <SlidersHorizontal className="size-5" />
        <span className="text-sm font-bold uppercase tracking-widest">Search Parameters</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        <div className="space-y-3">
          <Label htmlFor="genre" className="text-foreground/70 font-semibold">Category</Label>
          <Select name="genre" value={filters.genre || 'any'} onValueChange={handleGenreChange} disabled={isLoading}>
            <SelectTrigger id="genre" className="bg-background/50 border-white/10 h-12">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All Genres</SelectItem>
              {genres.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="keywords" className="text-foreground/70 font-semibold">Keywords</Label>
          <Input 
            id="keywords" 
            name="keywords" 
            placeholder="e.g., Space travel, biopic..." 
            value={filters.keywords} 
            onChange={handleInputChange} 
            disabled={isLoading}
            className="bg-background/50 border-white/10 h-12 placeholder:text-muted-foreground/50"
          />
        </div>
        
        <div className="space-y-3">
           <div className="flex justify-between items-center">
            <Label className="text-foreground/70 font-semibold">{searchType === 'movie' ? 'Release Year' : 'Air Year'}</Label>
            <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-0.5 rounded-full">{filters.releaseYear[0]}</span>
          </div>
          <div className="pt-2">
            <Slider
              value={filters.releaseYear}
              onValueChange={handleYearChange}
              min={1920}
              max={currentYear}
              step={1}
              disabled={isLoading}
              className="py-4"
            />
          </div>
        </div>
        
        <div className="space-y-3">
           <div className="flex justify-between items-center">
            <Label className="text-foreground/70 font-semibold">Minimum Rating</Label>
            <span className="text-xs font-mono bg-accent/20 text-accent px-2 py-0.5 rounded-full">{filters.rating[0].toFixed(1)} / 10</span>
          </div>
          <div className="pt-2">
            <Slider
              value={[filters.rating[0]]}
              onValueChange={(value) => handleRatingChange([value[0], 10])}
              min={0}
              max={10}
              step={0.5}
              disabled={isLoading}
              className="py-4"
            />
          </div>
        </div>
      </div>
      
      <div className="pt-4 flex justify-center md:justify-start">
        <Button 
          type="submit" 
          disabled={isLoading} 
          size="lg"
          className="w-full md:w-auto px-12 h-14 rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Search className="mr-2 h-5 w-5" />
          )}
          Find {searchType === 'movie' ? 'Movies' : 'TV Shows'}
        </Button>
      </div>
    </form>
  );
}
