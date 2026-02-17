
"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { MovieCarousel } from "@/components/movie-carousel"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Loader2, Smile, Sparkles } from "lucide-react"
import { getPosterUrl, searchMovies, getMovieVideos } from "@/lib/tmdb.client"
import { Movie } from "@/lib/tmdb"
import { Skeleton } from "../ui/skeleton"
import { getMoodBasedRecommendations } from "@/ai/flows/mood-based-recommendations"

const moods = ["Thrilling", "Adventurous", "Happy", "Sad", "Romantic", "Epic", "Funny", "Nostalgic"];

interface MovieWithPoster extends Movie {
    posterUrl: string | null;
}

export default function MoodSection() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<MovieWithPoster[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleMoodSelect = useCallback(async (mood: string) => {
    if (selectedMood === mood && recommendations.length > 0) return;
    
    setSelectedMood(mood)
    setIsLoading(true)
    setRecommendations([])
    try {
      const result = await getMoodBasedRecommendations({ mood });
      const movieTitles = result.movieSuggestions;
      
      const moviePromises = movieTitles.map(async (title) => {
        const searchResults = await searchMovies(title);
        const movie = searchResults.length > 0 ? searchResults[0] : null;
        if (movie) {
            const videos = await getMovieVideos(movie.id);
            const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
            return {
                ...movie,
                posterUrl: getPosterUrl(movie.poster_path),
                trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
            } as MovieWithPoster;
        }
        return null;
      });

      const moviesData = (await Promise.all(moviePromises)).filter((m): m is MovieWithPoster => m !== null);

      if (moviesData.length === 0) {
          toast({
              variant: "destructive",
              title: "No matches found",
              description: "We couldn't find matching movies for this mood in the live catalog.",
          });
      }

      setRecommendations(moviesData);

    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Signal Lost",
        description: "Failed to connect to the atmospheric discovery engine.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [selectedMood, recommendations.length, toast]);

  // Initial load "In Action"
  useEffect(() => {
    handleMoodSelect(moods[0]);
  }, []);

  return (
    <section className="py-6 space-y-8 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
            <Smile className="text-yellow-400 size-6 md:size-7" />
        </div>
        <div className="space-y-1">
            <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase text-white mb-0">
                Emotional <span className="text-yellow-400">Atmosphere</span>
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Select a vibe to architect your perfect cinematic session.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => (
          <Button
            key={mood}
            variant="outline"
            className={cn(
              "transition-all rounded-full px-6 py-6 font-bold uppercase tracking-widest text-[10px] border-white/10 glass-panel",
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
      
      <div className="min-h-[350px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[300px] gap-4">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
                    <Sparkles className="absolute -top-2 -right-2 text-yellow-400 size-4 animate-pulse" />
                </div>
                <p className="text-muted-foreground font-black tracking-widest uppercase text-[10px] animate-pulse">Scanning Archives for {selectedMood} vibe...</p>
            </div>
          ) : recommendations.length > 0 && selectedMood ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <MovieCarousel title="" movies={recommendations} />
            </div>
          ) : (
            <div className="h-[300px] bg-secondary/10 rounded-[2rem] border-2 border-dashed border-white/5 flex items-center justify-center">
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Select a mood to initialize transmission</p>
            </div>
          )}
      </div>
    </section>
  )
}
