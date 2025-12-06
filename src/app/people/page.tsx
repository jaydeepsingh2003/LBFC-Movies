
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { getPopularPeople, searchPeople } from '@/lib/tmdb.client';
import type { Person } from '@/lib/tmdb';
import { PersonCard } from '@/components/person-card';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchPeople = useCallback(async () => {
    setIsLoading(true);
    try {
      let results;
      if (debouncedSearchQuery) {
        results = await searchPeople(debouncedSearchQuery);
      } else {
        results = await getPopularPeople();
      }
      setPeople(results);
    } catch (error) {
      console.error("Failed to fetch people:", error);
      setPeople([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  return (
    <AppLayout>
      <div className="py-8">
        <header className="space-y-4 mb-8">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
            {debouncedSearchQuery ? 'Search Results' : 'Popular People'}
          </h1>
          <p className="text-muted-foreground">
            {debouncedSearchQuery ? `Showing results for "${debouncedSearchQuery}"` : "Discover this week's most popular actors and filmmakers."}
          </p>
          <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for an actor or director..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        ) : people.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {people.map(person => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        ) : (
            <div className="text-center py-16">
                <h3 className="text-lg font-semibold text-foreground">No Results Found</h3>
                <p className="text-muted-foreground mt-2">Try a different search term.</p>
            </div>
        )}
      </div>
    </AppLayout>
  );
}
