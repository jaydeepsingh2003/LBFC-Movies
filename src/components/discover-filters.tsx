'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Search } from 'lucide-react';

const genres = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", 
  "Drama", "Family", "Fantasy", "History", "Horror", "Music", 
  "Mystery", "Romance", "Science Fiction", "TV Movie", "Thriller", "War", "Western"
];

const currentYear = new Date().getFullYear();

export interface FilterState {
  genre: string;
  releaseYear: [number, number];
  actors: string;
  directors: string;
  rating: [number, number];
}

interface DiscoverFiltersProps {
  onSearch: (filters: FilterState) => void;
  isLoading: boolean;
}

export default function DiscoverFilters({ onSearch, isLoading }: DiscoverFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    genre: '',
    releaseYear: [1980, currentYear],
    actors: '',
    directors: '',
    rating: [5, 10],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (value: string) => {
    setFilters(prev => ({ ...prev, genre: value }));
  };

  const handleYearChange = (value: [number, number]) => {
    setFilters(prev => ({ ...prev, releaseYear: value }));
  };

  const handleRatingChange = (value: [number, number]) => {
    setFilters(prev => ({ ...prev, rating: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

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
              <Select name="genre" value={filters.genre} onValueChange={handleGenreChange} disabled={isLoading}>
                <SelectTrigger id="genre">
                  <SelectValue placeholder="Any Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Genre</SelectItem>
                  {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actors">Actors</Label>
              <Input id="actors" name="actors" placeholder="e.g., Tom Cruise, Zendaya" value={filters.actors} onChange={handleInputChange} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="directors">Directors</Label>
              <Input id="directors" name="directors" placeholder="e.g., Denis Villeneuve" value={filters.directors} onChange={handleInputChange} disabled={isLoading} />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
             <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Release Year</Label>
                <span className="text-sm text-muted-foreground">{filters.releaseYear[0]} - {filters.releaseYear[1]}</span>
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
            
            <div className="space-y-2">
               <div className="flex justify-between">
                <Label>User Rating</Label>
                <span className="text-sm text-muted-foreground">{filters.rating[0]} - {filters.rating[1]}</span>
              </div>
              <Slider
                value={filters.rating}
                onValueChange={handleRatingChange}
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
              Find Movies
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
