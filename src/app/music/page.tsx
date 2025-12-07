
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { getPopularPeople, searchPeople } from '@/lib/tmdb.client';
import type { Person } from '@/lib/tmdb';
import { PersonCard } from '@/components/person-card';
import { Loader2, Music } from 'lucide-react';

export default function MusicPage() {
  const [artists, setArtists] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchArtists() {
      setIsLoading(true);
      try {
        const popularPeople = await getPopularPeople();
        // A broader filter to include actors, singers (in sound dept), etc.
        const filteredArtists = popularPeople.filter(p => 
            p.known_for_department === 'Acting' || 
            p.known_for_department === 'Sound' ||
            p.popularity > 20 // Filter for more recognizable faces
        );
        
        setArtists(filteredArtists.slice(0, 28)); // Show a good number of artists

      } catch (error) {
        console.error("Failed to fetch artists:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArtists();
  }, []);

  return (
    <AppLayout>
      <div className="py-8 px-4 md:px-8 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <Music className="w-8 h-8 text-primary" />
             <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                Popular Artists
             </h1>
          </div>
          <p className="text-muted-foreground">
            Discover popular actors, singers, and other artists from the world of film.
          </p>
        </header>

        <section>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
            ) : artists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
                {artists.map(person => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
            ) : (
                <div className="text-center py-16">
                    <h3 className="text-lg font-semibold text-foreground">No Artists Found</h3>
                    <p className="text-muted-foreground mt-2">Could not load popular artists at this time.</p>
                </div>
            )}
        </section>
      </div>
    </AppLayout>
  );
}
