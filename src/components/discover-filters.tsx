'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Search, SlidersHorizontal, Globe, SortAsc, Tv } from 'lucide-react';

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

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

const ottProviders = [
  { id: '8', name: 'Netflix' },
  { id: '119', name: 'Amazon Prime' },
  { id: '337', name: 'Disney+' },
  { id: '220', name: 'JioCinema' },
  { id: '122', name: 'Lionsgate Play' },
];

const sortOptions = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Top Rated' },
  { value: 'primary_release_date.desc', label: 'Recently Released' },
  { value: 'revenue.desc', label: 'Box Office Hits' },
];

const currentYear = new Date().getFullYear();

export interface FilterState {
  genre: string;
  releaseYear: [number];
  keywords: string;
  rating: [number, number];
  language: string;
  provider: string;
  sortBy: string;
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
    language: '',
    provider: '',
    sortBy: 'popularity.desc',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value === 'any' ? '' : value }));
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
        <span className="text-sm font-bold uppercase tracking-widest">Advanced Search</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Genre & Sorting */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="genre" className="text-foreground/70 font-semibold flex items-center gap-2">
              Category
            </Label>
            <Select value={filters.genre || 'any'} onValueChange={(v) => handleSelectChange('genre', v)} disabled={isLoading}>
              <SelectTrigger className="bg-background/50 border-white/10 h-11">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">All Genres</SelectItem>
                {genres.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/70 font-semibold flex items-center gap-2">
              <SortAsc className="size-4" /> Sort By
            </Label>
            <Select value={filters.sortBy} onValueChange={(v) => handleSelectChange('sortBy', v)} disabled={isLoading}>
              <SelectTrigger className="bg-background/50 border-white/10 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(opt => <SelectItem key={v.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Language & OTT */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground/70 font-semibold flex items-center gap-2">
              <Globe className="size-4" /> Original Language
            </Label>
            <Select value={filters.language || 'any'} onValueChange={(v) => handleSelectChange('language', v)} disabled={isLoading}>
              <SelectTrigger className="bg-background/50 border-white/10 h-11">
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">All Languages</SelectItem>
                {languages.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/70 font-semibold flex items-center gap-2">
              <Tv className="size-4" /> Streaming On
            </Label>
            <Select value={filters.provider || 'any'} onValueChange={(v) => handleSelectChange('provider', v)} disabled={isLoading}>
              <SelectTrigger className="bg-background/50 border-white/10 h-11">
                <SelectValue placeholder="Any Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Platform</SelectItem>
                {ottProviders.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Keywords & Rating */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keywords" className="text-foreground/70 font-semibold">Keywords</Label>
            <Input 
              id="keywords" 
              name="keywords" 
              placeholder="e.g., Superhero, time travel..." 
              value={filters.keywords} 
              onChange={handleInputChange} 
              disabled={isLoading}
              className="bg-background/50 border-white/10 h-11"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-foreground/70 font-semibold">Min Rating</Label>
              <span className="text-xs font-mono bg-accent/20 text-accent px-2 py-0.5 rounded-full">{filters.rating[0].toFixed(1)}</span>
            </div>
            <Slider
              value={[filters.rating[0]]}
              onValueChange={(v) => handleRatingChange([v[0], 10])}
              min={0}
              max={10}
              step={0.5}
              disabled={isLoading}
              className="py-4"
            />
          </div>
        </div>

        {/* Release Year */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-foreground/70 font-semibold">{searchType === 'movie' ? 'Release Year' : 'Air Year'}</Label>
              <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-0.5 rounded-full">{filters.releaseYear[0]}</span>
            </div>
            <Slider
              value={filters.releaseYear}
              onValueChange={handleYearChange}
              min={1950}
              max={currentYear}
              step={1}
              disabled={isLoading}
              className="py-4"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-5 animate-spin" />
            ) : (
              <Search className="mr-2 size-5" />
            )}
            Search Catalog
          </Button>
        </div>
      </div>
    </form>
  );
}
