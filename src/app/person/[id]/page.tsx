'use client';

import React, { useState, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);
  const { id } = params;

  useEffect(() => {
    setMounted(true);
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
      <div className="flex flex-col justify-center items-center h-svh gap-6 bg-transparent">
        <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground animate-pulse font-black tracking-[0.4em] uppercase text-[10px]">Accessing Personnel Files...</p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="text-center py-32">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Personnel Record Offline</h2>
      </div>
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
    <div className="space-y-12 px-4 py-12 md:px-8 lg:px-12 max-w-[2000px] mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row items-center md:items-start gap-10">
        <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            <Avatar className="size-48 md:size-64 border-4 border-primary shadow-2xl relative z-10 transition-transform group-hover:scale-105">
              <AvatarImage src={getPosterUrl(person.profile_path) || ''} alt={person.name} className="object-cover" />
              <AvatarFallback className="bg-secondary text-primary font-black text-6xl">{person.name.charAt(0)}</AvatarFallback>
            </Avatar>
        </div>
        <div className="space-y-6 text-center md:text-left flex-1">
          <div className="space-y-2">
            <h1 className="font-headline text-4xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">{person.name}</h1>
            <p className="text-primary text-sm font-black uppercase tracking-[0.4em] opacity-80">{person.known_for_department}</p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-muted-foreground">
              {mounted && person.birthday && (
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                      <Cake className="size-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">
                          {new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          {!person.deathday && ` (Age ${getAge(person.birthday, null)})`}
                      </span>
                  </div>
              )}
               {mounted && person.deathday && (
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-destructive">Deceased: {new Date(person.deathday).toLocaleDateString()} (Aged {getAge(person.birthday!, person.deathday)})</span>
                  </div>
              )}
              {person.place_of_birth && (
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                      <MapPin className="size-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">{person.place_of_birth}</span>
                  </div>
              )}
          </div>

          <p className="text-muted-foreground/90 leading-relaxed font-medium text-lg max-w-4xl line-clamp-[8]">
              {person.biography || "Personnel biography details are currently classified within the central archive."}
          </p>
        </div>
      </header>

      <Separator className="bg-white/5" />

      <section className="space-y-10">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-2xl">
                <Film className="size-8 text-primary" />
            </div>
            <div className="space-y-1">
                <h2 className="font-headline text-3xl font-black tracking-tighter text-white uppercase leading-none">Filmography <span className="text-primary">Registry</span></h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">High-fidelity catalog of notable cinematic contributions.</p>
            </div>
        </div>

        {knownForMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 animate-in fade-in duration-1000">
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
          <div className="text-center py-32 glass-panel rounded-[3rem] border-2 border-dashed border-white/5">
              <Film className="mx-auto size-16 text-muted-foreground/20 mb-6" />
              <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Registry Empty</h3>
              <p className="mt-2 text-muted-foreground font-medium uppercase text-[10px] tracking-widest">No major cinematic transmissions detected for this individual.</p>
          </div>
        )}
      </section>

      {person.images.profiles.length > 1 && (
          <section className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-400/10 rounded-2xl border border-blue-400/20 shadow-2xl">
                    <Clapperboard className="size-8 text-blue-400" />
                </div>
                <div className="space-y-1">
                    <h2 className="font-headline text-3xl font-black tracking-tighter text-white uppercase leading-none">Visual <span className="text-blue-400">Archives</span></h2>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">Verified production stills and personnel photography.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 animate-in fade-in duration-1000">
                  {person.images.profiles.slice(1, 21).map((image, index) => (
                      <div key={index} className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden border border-white/5 group hover:border-primary/50 transition-all shadow-2xl">
                          <Image 
                              src={getPosterUrl(image.file_path) || ''} 
                              alt={`${person.name} photo ${index + 1}`}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                              unoptimized
                          />
                          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                  ))}
              </div>
          </section>
      )}
    </div>
  );
}
