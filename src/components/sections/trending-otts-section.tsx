
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getPosterUrl, searchMovies, getMovieVideos, searchTvShows, discoverMovies, discoverTvShows } from '@/lib/tmdb.client';
import { Movie, TVShow } from '@/lib/tmdb';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { MovieCard } from '../movie-card';
import { TVShowCard } from '../tv-show-card';

interface ContentWithPoster extends Partial<Movie>, Partial<TVShow> {
  posterUrl: string | null;
  title: string;
  type: 'movie' | 'tv';
  id: number;
}

const ottPlatforms = [
  {
    name: 'Netflix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png',
    provider_id: 8,
  },
  {
    name: 'Amazon Prime',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/2560px-Amazon_Prime_Video_logo.svg.png',
    provider_id: 119,
  },
  {
    name: 'Lionsgate Play',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbh8ibZRnfFlrYgGE_44c-lZ9JZvHOxzT7FQ&s',
    provider_id: 257,
  },
];

export default function TrendingOttsSection() {
  const [activePlatform, setActivePlatform] = useState(ottPlatforms[0].name);
  const [contentData, setContentData] = useState<ContentWithPoster[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activePlatformLogo = useMemo(() => {
    return ottPlatforms.find(p => p.name === activePlatform)?.logo;
  }, [activePlatform]);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const platform = ottPlatforms.find((p) => p.name === activePlatform);
      if (!platform) {
        setIsLoading(false);
        return;
      }

      const [movieResults, tvShowResults] = await Promise.all([
        discoverMovies({ with_watch_providers: platform.provider_id.toString(), watch_region: 'IN' }),
        discoverTvShows({ with_watch_providers: platform.provider_id.toString(), watch_region: 'IN' }),
      ]);
      
      const moviesWithTrailers = await Promise.all(
        movieResults.map(async (movie) => {
          const videos = await getMovieVideos(movie.id);
          const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
          return {
            ...movie,
            trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
          };
        })
      );
      
      const combinedContent: ContentWithPoster[] = [
        ...moviesWithTrailers.map(item => ({...item, type: 'movie' as const, title: item.title, posterUrl: getPosterUrl(item.poster_path)})),
        ...tvShowResults.map(item => ({...item, type: 'tv' as const, title: item.name, posterUrl: getPosterUrl(item.poster_path)}))
      ];

      // Sort by popularity
      combinedContent.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      
      setContentData(combinedContent.slice(0, 20)); // Limit to top 20
      setIsLoading(false);
    };

    fetchContent();
  }, [activePlatform]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(7)].map((_, i) => (
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
          {contentData.map((item) => (
            <CarouselItem
              key={`${item.type}-${item.id}`}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2 md:pl-4"
            >
              {item.type === 'movie' ? (
                <MovieCard
                    id={item.id}
                    title={item.title}
                    posterUrl={item.posterUrl}
                    trailerUrl={item.trailerUrl}
                    aspect="portrait"
                />
              ) : (
                <TVShowCard
                    id={item.id}
                    title={item.title}
                    posterUrl={item.posterUrl}
                />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-12 bg-background/50 hover:bg-background" />
        <CarouselNext className="mr-12 bg-background/50 hover:bg-background" />
      </Carousel>
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="font-headline text-2xl font-bold tracking-tight">
          Trending Now on
        </h2>
        {activePlatformLogo && (
          <div className="relative h-8 w-28">
            <Image
              src={activePlatformLogo}
              alt={`${activePlatform} logo`}
              fill
              className="object-contain"
            />
          </div>
        )}
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
            <div className={cn("relative h-6 w-20 md:h-8 md:w-28")}>
              <Image
                src={platform.logo}
                alt={platform.name}
                fill
                className="object-contain"
              />
            </div>
          </button>
        ))}
      </div>

      <div className="min-h-[350px]">
        {renderContent()}
      </div>
      
    </section>
  );
}
