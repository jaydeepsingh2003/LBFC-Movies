
'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { getPersonDetails, getPosterUrl, getMovieVideos } from '@/lib/tmdb.client';
import type { PersonDetails, Movie as FilmographyMovie } from '@/lib/tmdb';
import { Loader2, Cake, MapPin, Film, Clapperboard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MovieCard } from '@/components/movie-card';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export default function PersonPage(props: { params: { id: string } }) {
  const params = React.use(props.params);
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [knownForMovies, setKnownForMovies] = useState<FilmographyMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = params;

  useEffect(() => {
    if (!id) return;

    async function fetchPersonData() {
      setIsLoading(true);
      try {
        const personId = parseInt(id as string, 10);
        const personDetails = await getPersonDetails(personId);
        setPerson(personDetails);
        
        const filmography = [...personDetails.movie_credits.cast, ...personDetails.movie_credits.crew]
          .filter(movie => movie.poster_path)
          .sort((a, b) => b.vote_average - a.vote_average)
          .slice(0, 18);

        const moviePromises = filmography.map(async (movie) => {
          const videos = await getMovieVideos(movie.id);
          const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
          return {
            ...movie,
            trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
          };
        });
        
        const moviesWithTrailers = await Promise.all(moviePromises);
        setKnownForMovies(moviesWithTrailers);

      } catch (error) {
        console.error("Error fetching person data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPersonData();
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-32 w-32 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!person) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">Person not found</h2>
        </div>
      </AppLayout>
    );
  }

  const getAge = (birthDate: string, deathDate: string | null) => {
    if (!birthDate) return null;
    const end = deathDate ? new Date(deathDate) : new Date();
    const start = new Date(birthDate);
    let age = end.getFullYear() - start.getFullYear();
    const m = end.getMonth() - start.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < start.getDate())) {
        age--;
    }
    return age;
  };

  return (
    <AppLayout>
      <div className="space-y-8 px-4 py-8 md:px-8">
        <header className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <Avatar className="h-48 w-48 border-4 border-primary">
            <AvatarImage src={getPosterUrl(person.profile_path)} alt={person.name} />
            <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-3 text-center md:text-left">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground">{person.name}</h1>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Clapperboard className="w-4 h-4" />
                    <span>{person.known_for_department}</span>
                </div>
                {person.birthday && (
                    <div className="flex items-center gap-2">
                        <Cake className="w-4 h-4" />
                        <span>
                            {new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            {!person.deathday && ` (age ${getAge(person.birthday, null)})`}
                        </span>
                    </div>
                )}
                 {person.deathday && (
                    <div className="flex items-center gap-2">
                        <span>Died: {new Date(person.deathday).toLocaleDateString()} (aged ${getAge(person.birthday, person.deathday)})</span>
                    </div>
                )}
                {person.place_of_birth && (
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{person.place_of_birth}</span>
                    </div>
                )}
            </div>

            <p className="text-foreground/80 leading-relaxed pt-4 max-w-3xl line-clamp-[8]">
                {person.biography || "No biography available."}
            </p>
          </div>
        </header>

        <Separator />

        <section>
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground mb-6">Known For</h2>
          {knownForMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {knownForMovies.map(movie => (
                <MovieCard
                  key={`${movie.id}-${(movie as any).credit_id}`}
                  id={movie.id}
                  title={movie.title}
                  posterUrl={getPosterUrl(movie.poster_path)}
                  overview={movie.overview}
                  poster_path={movie.poster_path}
                  trailerUrl={movie.trailerUrl}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-secondary rounded-lg">
                <Film className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No Movies Found</h3>
                <p className="mt-2 text-sm text-muted-foreground">We couldn't find any major film credits for this person.</p>
            </div>
          )}
        </section>

        {person.images.profiles.length > 1 && (
            <section>
                <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground mb-6">Photos</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                    {person.images.profiles.slice(1, 15).map((image, index) => (
                        <Card key={index} className="overflow-hidden">
                           <CardContent className="p-0 aspect-square relative w-full">
                                <Image 
                                    src={getPosterUrl(image.file_path)} 
                                    alt={`${person.name} photo ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        )}

      </div>
    </AppLayout>
  );
}
