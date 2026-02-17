'use client';

import { useState, useEffect } from 'react';
import { getPosterUrl, discoverMovies, discoverTvShows } from '@/lib/tmdb.client';
import { Movie, TVShow } from '@/lib/tmdb';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { MovieCard } from '../movie-card';
import { TVShowCard } from '../tv-show-card';
import { Clapperboard } from 'lucide-react';

interface ContentWithPoster extends Partial<Movie>, Partial<TVShow> {
  posterUrl: string | null;
  title: string;
  type: 'movie' | 'tv';
  id: number;
}

const ottPlatforms = [
  {
    name: 'Netflix',
    provider_id: 8,
  },
  {
    name: 'Prime Video',
    provider_id: 119,
  },
  {
    name: 'Disney+',
    provider_id: 337,
  }
];

export default function TrendingOttsSection() {
  const [activePlatform, setActivePlatform] = useState(ottPlatforms[0].name);
  const [contentData, setContentData] = useState<ContentWithPoster[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const platform = ottPlatforms.find((p) => p.name === activePlatform);
      if (!platform) {
        setIsLoading(false);
        return;
      }

      try {
        const [movieResults, tvShowResults] = await Promise.all([
          discoverMovies({ with_watch_providers: platform.provider_id.toString(), watch_region: 'IN' }),
          discoverTvShows({ with_watch_providers: platform.provider_id.toString(), watch_region: 'IN' }),
        ]);
        
        const combinedContent: ContentWithPoster[] = [
          ...movieResults.map(item => ({...item, type: 'movie' as const, title: item.title, posterUrl: getPosterUrl(item.poster_path)})),
          ...tvShowResults.map(item => ({...item, type: 'tv' as const, title: item.name, posterUrl: getPosterUrl(item.poster_path)}))
        ];

        combinedContent.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        setContentData(combinedContent.slice(0, 18));
      } catch (error) {
        console.error("OTT Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [activePlatform]);

  return (
    <section className="py-12 space-y-8 border-b border-white/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Clapperboard className="text-primary size-6 md:size-7" />
            </div>
            <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase text-white mb-0">
                Trending on <span className="text-primary">OTT</span>
            </h2>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-12 md:ml-14">The most watched titles on your favorite platforms today.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl overflow-x-auto no-scrollbar">
          {ottPlatforms.map((platform) => {
            const isActive = activePlatform === platform.name;
            return (
                <button
                    key={platform.name}
                    onClick={() => setActivePlatform(platform.name)}
                    className={cn(
                        'flex-shrink-0 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                        isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    )}
                >
                    {platform.name}
                </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-[350px] relative">
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] w-40 md:w-56 flex-shrink-0 rounded-2xl" />
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: 'start', loop: false, dragFree: true }} className="w-full">
            <CarouselContent className="-ml-4 md:-ml-6">
              {contentData.map((item) => (
                <CarouselItem key={`${item.type}-${item.id}`} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/7 pl-4 md:pl-6">
                  {item.type === 'movie' ? (
                    <MovieCard id={item.id} title={item.title} posterUrl={item.posterUrl} overview={item.overview} poster_path={item.poster_path} />
                  ) : (
                    <TVShowCard id={item.id} title={item.title} posterUrl={item.posterUrl} overview={item.overview} poster_path={item.poster_path} />
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 h-12 w-12 glass-panel border-none hover:bg-primary shadow-2xl" />
            <CarouselNext className="hidden md:flex -right-12 h-12 w-12 glass-panel border-none hover:bg-primary shadow-2xl" />
          </Carousel>
        )}
      </div>
    </section>
  );
}
