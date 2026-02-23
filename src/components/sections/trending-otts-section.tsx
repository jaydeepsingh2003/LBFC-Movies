"use client";

import { useState, useEffect } from 'react';
import { getPosterUrl, discoverMovies, discoverTvShows } from '@/lib/tmdb.client';
import { Movie, TVShow } from '@/lib/tmdb';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { MovieCard } from '../movie-card';
import { TVShowCard } from '../tv-show-card';
import { Clapperboard, MonitorPlay, Zap } from 'lucide-react';

interface ContentWithPoster extends Partial<Movie>, Partial<TVShow> {
  posterUrl: string | null;
  title: string;
  type: 'movie' | 'tv';
  id: number;
}

const ottPlatforms = [
  { name: 'Netflix', provider_id: '8' },
  { name: 'Prime Video', provider_id: '119' },
  { name: 'Disney+', provider_id: '122|337' },
  { name: 'JioCinema', provider_id: '220' },
  { name: 'Sony LIV', provider_id: '237' },
  { name: 'Zee5', provider_id: '232' }
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
          discoverMovies({ with_watch_providers: platform.provider_id, watch_region: 'IN' }),
          discoverTvShows({ with_watch_providers: platform.provider_id, watch_region: 'IN' }),
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
    <section className="py-16 space-y-12 border-t border-white/5 relative">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10">
                <Clapperboard className="text-primary size-7 md:size-8" />
            </div>
            <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter uppercase text-white mb-0 leading-none">
                Streaming <span className="text-primary">Giants</span>
            </h2>
          </div>
          <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60 ml-16 md:ml-20">Real-time dynamic catalogs from your favorite global hubs.</p>
        </div>
        
        <div className="flex items-center gap-3 p-2 glass-panel rounded-[2rem] border-white/10 overflow-x-auto no-scrollbar max-w-full xl:max-w-none shadow-2xl">
          {ottPlatforms.map((platform) => {
            const isActive = activePlatform === platform.name;
            return (
                <button
                    key={platform.name}
                    onClick={() => setActivePlatform(platform.name)}
                    className={cn(
                        'flex-shrink-0 px-8 py-3.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap border border-transparent',
                        isActive
                        ? 'bg-primary text-white shadow-2xl shadow-primary/30 scale-105 border-white/10'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    )}
                >
                    {platform.name}
                </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-[400px] relative">
        {isLoading ? (
          <div className="flex gap-8 overflow-hidden">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] w-48 md:w-64 flex-shrink-0 rounded-[2.5rem] bg-secondary/20" />
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: 'start', loop: false, dragFree: true }} className="w-full">
            <CarouselContent className="-ml-4 md:-ml-8">
              {contentData.map((item) => (
                <CarouselItem key={`${item.type}-${item.id}`} className="basis-[75%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-4 md:pl-8">
                  <div className="transition-transform duration-500 hover:-translate-y-3">
                    {item.type === 'movie' ? (
                        <MovieCard id={item.id} title={item.title} posterUrl={item.posterUrl} overview={item.overview} poster_path={item.poster_path} className="shadow-2xl border-white/5" />
                    ) : (
                        <TVShowCard id={item.id} title={item.title} posterUrl={item.posterUrl} overview={item.overview} poster_path={item.poster_path} className="shadow-2xl border-white/5" />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden xl:flex -left-16 size-14 glass-panel border-white/10 hover:bg-primary shadow-2xl hover:text-white" />
            <CarouselNext className="hidden xl:flex -right-16 size-14 glass-panel border-white/10 hover:bg-primary shadow-2xl hover:text-white" />
          </Carousel>
        )}
      </div>
    </section>
  );
}