
'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { getPopularPeople } from '@/lib/tmdb.client';
import type { Person } from '@/lib/tmdb';
import { PersonCard } from '@/components/person-card';
import { Loader2 } from 'lucide-react';

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPeople() {
      setIsLoading(true);
      try {
        const popularPeople = await getPopularPeople();
        setPeople(popularPeople);
      } catch (error) {
        console.error("Failed to fetch popular people:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPeople();
  }, []);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <header className="space-y-2 mb-8">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">Popular People</h1>
          <p className="text-muted-foreground">Discover this week's most popular actors and filmmakers.</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {people.map(person => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
