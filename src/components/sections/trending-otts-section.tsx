'use client';

import { useState, useEffect } from 'react';
import { MovieCarousel } from '../movie-carousel';
import { getPosterUrl, searchMovies, getMovieVideos } from '@/lib/tmdb.client';
import { Movie } from '@/lib/tmdb';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Flame } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel';
import { MovieCard } from '../movie-card';
import { Card, CardContent } from '../ui/card';

interface MovieWithPoster extends Partial<Movie> {
  posterUrl: string | null;
  title: string;
}

const ottPlatforms = [
  {
    name: 'JioHotstar',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/JioCinema_logo.svg',
    movies: ['Superman', 'The Great Shamsuddin Family', 'Dies Irae'],
  },
  {
    name: 'SonyLIV',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/SonyLIV_logo.svg/1200px-SonyLIV_logo.svg.png',
    movies: ['Scam 1992', 'Gullak', 'Maharani'],
  },
  {
    name: 'Lionsgate Play',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Lionsgate_Play.svg/1200px-Lionsgate_Play.svg.png',
    movies: ['John Wick', 'The Hunger Games', 'Knives Out'],
  },
  {
    name: 'Aha',
    logo: 'https://www.aha.video/aha-logo.db810aeaa42b356b.svg',
    movies: ['Colour Photo', 'Krack', 'Naandhi'],
  },
];

export default function TrendingOttsSection() {
  const [activePlatform, setActivePlatform] = useState(ottPlatforms[0].name);
  const [moviesData, setMoviesData] = useState<MovieWithPoster[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      const platform = ottPlatforms.find((p) => p.name === activePlatform);
      if (!platform) {
        setIsLoading(false);
        return;
      }

      const moviePromises = platform.movies.map(async (title) => {
        const searchResults = await searchMovies(title);
        const movie = searchResults.length > 0 ? searchResults[0] : null;
        if (movie) {
          const videos = await getMovieVideos(movie.id);
          const trailer = videos.find(
            (v) => v.type === 'Trailer' && v.site === 'YouTube' && v.official
          );
          movie.trailerUrl = trailer
            ? `https://www.youtube.com/watch?v=${trailer.key}`
            : undefined;
        }
        return movie;
      });

      const fetchedMovies = (await Promise.all(moviePromises))
        .filter((movie): movie is Movie => movie !== null)
        .map((movie) => ({
          ...movie,
          posterUrl: getPosterUrl(movie.poster_path),
        }));

      setMoviesData(fetchedMovies);
      setIsLoading(false);
    };

    fetchMovies();
  }, [activePlatform]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-[2/3] w-40 md:w-48 flex-shrink-0 rounded-lg"
            />
          ))}
        </div>
      );
    }
    return (
      <Carousel
        opts={{
          align: 'start',
          loop: false,
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {moviesData.map((movie, index) => (
            <CarouselItem
              key={movie.id || index}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2 md:pl-4"
            >
              <MovieCard
                id={movie.id!}
                title={movie.title!}
                posterUrl={movie.posterUrl}
                trailerUrl={movie.trailerUrl}
                aspect="portrait"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Flame className="text-primary" />
        <h2 className="font-headline text-2xl font-bold tracking-tight">
          Trending Now in {activePlatform}
        </h2>
      </div>

      <div className="flex space-x-2 md:space-x-4 overflow-x-auto pb-2">
        {ottPlatforms.map((platform) => (
          <button
            key={platform.name}
            onClick={() => setActivePlatform(platform.name)}
            className={cn(
              'flex-shrink-0 p-2 md:p-3 rounded-lg transition-all duration-300',
              activePlatform === platform.name
                ? 'bg-primary/20 border-2 border-primary'
                : 'bg-secondary'
            )}
          >
            <div className="relative h-6 w-20 md:h-8 md:w-28">
              <Image
                src={platform.logo}
                alt={platform.name}
                fill
                className="object-contain"
                style={{ filter: activePlatform !== platform.name ? 'grayscale(100%)' : 'none', opacity: activePlatform !== platform.name ? 0.7 : 1 }}
              />
            </div>
          </button>
        ))}
      </div>

      {renderContent()}
      <a
        href="#"
        className="text-primary font-semibold hover:underline text-center block mt-4"
      >
        Explore {activePlatform} &gt;
      </a>
    </section>
  );
}
