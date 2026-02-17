"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Loader2, Smile } from "lucide-react"
import { getPosterUrl, discoverMovies, discoverTvShows } from "@/lib/tmdb.client"
import { Skeleton } from "../ui/skeleton"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { MovieCard } from '../movie-card'
import { TVShowCard } from '../tv-show-card'

const moods = ["Thrilling", "Adventurous", "Happy", "Sad", "Romantic", "Epic", "Funny", "Nostalgic"];

const MOOD_GENRES: Record<string, { movie: number[], tv: number[] }> = {
  "Thrilling": { movie: [53, 28], tv: [10759, 80] },
  "Adventurous": { movie: [12], tv: [10759] },
  "Happy": { movie: [35, 10751], tv: [35] },
  "Sad": { movie: [18], tv: [18] },
  "Romantic": { movie: [10749], tv: [18] },
  "Epic": { movie: [878, 10752], tv: [10765] },
  "Funny": { movie: [35], tv: [35] },
  "Nostalgic": { movie: [14, 16], tv: [10765] }
};

interface ContentItem {
    id: number;
    title: string;
    posterUrl: string | null;
    type: 'movie' | 'tv';
    overview?: string;
    poster_path?: string | null;
}

export default function MoodSection() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [content, setContent] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleMoodSelect = useCallback(async (mood: string) => {
    setSelectedMood(mood)
    setIsLoading(true)
    setContent([])
    try {
      const genres = MOOD_GENRES[mood];
      const [movies, shows] = await Promise.all([
        discoverMovies({ genreId: genres.movie[0], sort_by: 'popularity.desc' }),
        discoverTvShows({ genreId: genres.tv[0], sortBy: 'popularity.desc' })
      ]);

      const combined: ContentItem[] = [
        ...movies.slice(0, 10).map(m => ({ 
            id: m.id, 
            title: m.title, 
            posterUrl: getPosterUrl(m.poster_path), 
            type: 'movie' as const,
            overview: m.overview,
            poster_path: m.poster_path
        })),
        ...shows.slice(0, 10).map(s => ({ 
            id: s.id, 
            title: s.name, 
            posterUrl: getPosterUrl(s.poster_path), 
            type: 'tv' as const,
            overview: s.overview,
            poster_path: s.poster_path
        }))
      ].sort(() => 0.5 - Math.random());

      setContent(combined);

    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Atmosphere Unstable",
        description: "Failed to connect to the atmospheric discovery engine.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast]);

  useEffect(() => {
    handleMoodSelect(moods[0]);
  }, [handleMoodSelect]);

  return (
    <section className="py-4 space-y-8 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
            <Smile className="text-yellow-400 size-6 md:size-7" />
        </div>
        <div className="space-y-1">
            <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase text-white mb-0">
                Emotional <span className="text-yellow-400">Atmosphere</span>
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Surgically indexed from the global catalog to match your exact vibe.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {moods.map((mood) => (
          <Button
            key={mood}
            variant="outline"
            className={cn(
              "transition-all rounded-full px-6 py-6 font-black uppercase tracking-widest text-[10px] border-white/10 glass-panel shrink-0",
              selectedMood === mood && "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
            )}
            onClick={() => handleMoodSelect(mood)}
            disabled={isLoading && selectedMood === mood}
          >
            {isLoading && selectedMood === mood && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mood}
          </Button>
        ))}
      </div>
      
      <div className="min-h-[350px] relative">
          {isLoading ? (
            <div className="flex gap-4 overflow-hidden">
                {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[2/3] w-40 md:w-56 flex-shrink-0 rounded-2xl" />
                ))}
            </div>
          ) : content.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Carousel opts={{ align: 'start', loop: false, dragFree: true }} className="w-full">
                    <CarouselContent className="-ml-4 md:-ml-6">
                        {content.map((item) => (
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
            </div>
          ) : (
            <div className="h-[300px] bg-secondary/10 rounded-[2rem] border-2 border-dashed border-white/5 flex items-center justify-center">
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Syncing Archives...</p>
            </div>
          )}
      </div>
    </section>
  )
}