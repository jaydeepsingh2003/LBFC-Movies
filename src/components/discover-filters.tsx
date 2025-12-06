
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Search } from 'lucide-react';

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
    <Card>
      <CardHeader>
        <CardTitle>Filter Options</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select name="genre" value={filters.genre || 'any'} onValueChange={handleGenreChange} disabled={isLoading}>
                <SelectTrigger id="genre">
                  <SelectValue placeholder="Any Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Genre</SelectItem>
                  {genres.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input id="keywords" name="keywords" placeholder="e.g., based on a true story" value={filters.keywords} onChange={handleInputChange} disabled={isLoading} />
            </div>
            
            <div className="space-y-2">
               <div className="flex justify-between">
                <Label>{searchType === 'movie' ? 'Release Year' : 'First Air Year'}</Label>
                <span className="text-sm text-muted-foreground">{filters.releaseYear[0]}</span>
              </div>
              <Slider
                value={filters.releaseYear}
                onValueChange={handleYearChange}
                min={1920}
                max={currentYear}
                step={1}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2 col-span-1 lg:col-span-3">
               <div className="flex justify-between">
                <Label>Minimum User Rating</Label>
                <span className="text-sm text-muted-foreground">{filters.rating[0]} / 10</span>
              </div>
              <Slider
                value={[filters.rating[0]]}
                onValueChange={(value) => handleRatingChange([value[0], 10])}
                min={0}
                max={10}
                step={0.5}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="pt-4">
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Find {searchType === 'movie' ? 'Movies' : 'TV Shows'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
