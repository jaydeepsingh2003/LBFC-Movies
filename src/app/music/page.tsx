'use client';

import { useState, useEffect, useCallback }
from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { getPopularPeople, searchPeople } from '@/lib/tmdb.client';
import type { Person } from '@/lib/tmdb';
import { PersonCard } from '@/components/person-card';
import { Loader2, Search, Music } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { MovieCarousel } from '@/components/movie-carousel';
import { getPosterUrl, searchMovies as searchTmdbMovies, getMovieVideos } from '@/lib/tmdb.client';
import type { Movie } from '@/lib/tmdb';

interface MovieWithPoster extends Movie {
  posterUrl: string | null;
}

const popularSoundtrackMovies = [
    "The Lord of the Rings: The Fellowship of the Ring", "Star Wars: A New Hope", "Inception", "Interstellar", 
    "Gladiator", "Pirates of the Caribbean: The Curse of the Black Pearl", "The Dark Knight", 
    "Jurassic Park", "Forrest Gump", "La La Land"
];


export default function MusicPage() {
  const [composers, setComposers] = useState<Person[]>([]);
  const [soundtrackMovies, setSoundtrackMovies] = useState<MovieWithPoster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoviesLoading, setIsMoviesLoading] = useState(true);

  useEffect(() => {
    async function fetchComposers() {
      setIsLoading(true);
      try {
        const allPopular = await getPopularPeople();
        // Filter for people likely to be composers based on TMDB's 'known_for_department'
        const filteredComposers = allPopular.filter(p => p.known_for_department === 'Sound' || p.known_for_department === 'Directing' || p.known_for_department === 'Acting');
        
        // Manually add some famous composers who might not be in the popular list right now
        const famousComposerNames = ["Hans Zimmer", "John Williams", "Howard Shore", "Ludwig Göransson", "Hildur Guðnadóttir"];
        const composerPromises = famousComposerNames.map(name => searchPeople(name));
        const composerResults = await Promise.all(composerPromises);
        const famousComposers = composerResults.map(res => res[0]).filter(Boolean);

        const combined = [...famousComposers, ...filteredComposers];
        const uniqueComposers = Array.from(new Map(combined.map(item => [item['id'], item])).values());
        
        setComposers(uniqueComposers.sort((a,b) => b.popularity - a.popularity).slice(0, 14));

      } catch (error) {
        console.error("Failed to fetch composers:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    async function fetchSoundtrackMovies() {
        setIsMoviesLoading(true);
        try {
            const moviePromises = popularSoundtrackMovies.map(async (title) => {
                const results = await searchTmdbMovies(title);
                const movie = results[0];
                if (movie) {
                    const videos = await getMovieVideos(movie.id);
                    const trailer = videos.find(v => v.type === 'Trailer');
                    return {
                        ...movie,
                        posterUrl: getPosterUrl(movie.poster_path),
                        trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
                    }
                }
                return null;
            });
            const movies = (await Promise.all(moviePromises)).filter(Boolean) as MovieWithPoster[];
            setSoundtrackMovies(movies);
        } catch (error) {
            console.error("Failed to fetch soundtrack movies:", error);
        } finally {
            setIsMoviesLoading(false);
        }
    }

    fetchComposers();
    fetchSoundtrackMovies();
  }, []);

  return (
    <AppLayout>
      <div className="py-8 px-4 md:px-8 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <Music className="w-8 h-8 text-primary" />
             <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                Music
             </h1>
          </div>
          <p className="text-muted-foreground">
            Discover the artists behind the scores and some of the most iconic movie soundtracks.
          </p>
        </header>

        <section>
             <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground mb-6">Popular Film Composers</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
            ) : composers.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
                {composers.map(person => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
            ) : (
                <div className="text-center py-16">
                    <h3 className="text-lg font-semibold text-foreground">No Composers Found</h3>
                    <p className="text-muted-foreground mt-2">Could not load popular composers at this time.</p>
                </div>
            )}
        </section>

        <section>
            <MovieCarousel title="Iconic Soundtracks" movies={soundtrackMovies} />
        </section>

      </div>
    </AppLayout>
  );
}