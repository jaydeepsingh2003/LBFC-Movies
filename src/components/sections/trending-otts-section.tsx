
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getPosterUrl, searchMovies, getMovieVideos, searchTvShows } from '@/lib/tmdb.client';
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
    content: [
        { title: 'Stranger Things', type: 'tv' }, 
        { title: 'The Witcher', type: 'tv' }, 
        { title: 'Bridgerton', type: 'tv' }
    ],
  },
  {
    name: 'Amazon Prime',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/2560px-Amazon_Prime_Video_logo.svg.png',
    content: [
        { title: 'The Family Man', type: 'tv' }, 
        { title: 'Mirzapur', type: 'tv' }, 
        { title: 'Paatal Lok', type: 'tv' }
    ],
  },
  {
    name: 'Lionsgate Play',
    logo: 'https://i.ibb.co/b3prd6B/lionsgate-play-logo.png',
    content: [
      { title: 'John Wick: Chapter 4', type: 'movie' },
      { title: 'The Hunger Games: The Ballad of Songbirds & Snakes', type: 'movie' },
      { title: 'The Continental: From the World of John Wick', type: 'tv' },
    ],
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

      const contentPromises = platform.content.map(async (item) => {
        const searchFunction = item.type === 'movie' ? searchMovies : searchTvShows;
        const searchResults = await searchFunction(item.title);
        const contentItem = searchResults.length > 0 ? searchResults[0] : null;
        
        if (contentItem) {
          const videos = await getMovieVideos(contentItem.id);
          const trailer = videos.find(
            (v) => v.type === 'Trailer' && v.site === 'YouTube' && v.official
          );
          (contentItem as any).trailerUrl = trailer
            ? `https://www.youtube.com/watch?v=${trailer.key}`
            : undefined;
        }
        return { content: contentItem, type: item.type };
      });

      const fetchedContent = await Promise.all(contentPromises);
        
      const processedContent: ContentWithPoster[] = fetchedContent
        .filter((item) => item.content !== null)
        .map((item) => ({
          ...item.content,
          id: item.content!.id,
          title: (item.content as Movie).title || (item.content as TVShow).name,
          posterUrl: getPosterUrl(item.content!.poster_path),
          type: item.type as 'movie' | 'tv',
        }));

      setContentData(processedContent);
      setIsLoading(false);
    };

    fetchContent();
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
          {contentData.map((item) => (
            <CarouselItem
              key={item.id}
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
            <div className="relative h-6 w-20 md:h-8 md:w-28">
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
