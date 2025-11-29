"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MovieCarousel } from "@/components/movie-carousel"
import { getMoodBasedRecommendations } from "@/ai/flows/mood-based-recommendations"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { getPosterUrl, searchMovies, getMovieVideos } from "@/lib/tmdb.client"
import { Movie } from "@/lib/tmdb"

const moods = ["Happy", "Sad", "Adventurous", "Romantic", "Thrilling", "Funny"];

interface MovieWithPoster extends Movie {
    posterUrl: string | null;
}

export default function MoodSection() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<MovieWithPoster[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood)
    setIsLoading(true)
    setRecommendations([])
    try {
      const result = await getMoodBasedRecommendations({ mood })
      
      const moviePromises = result.movieSuggestions.map(async (title) => {
        const searchResults = await searchMovies(title);
        const movie = searchResults.length > 0 ? searchResults[0] : null;
        if (movie) {
            const videos = await getMovieVideos(movie.id);
            const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
            movie.trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;
        }
        return movie;
      });

      const moviesData = (await Promise.all(moviePromises))
        .map((movie, index) => ({
            ...(movie || { title: result.movieSuggestions[index], poster_path: null, id: 0, overview: "" }),
            title: movie ? movie.title : result.movieSuggestions[index],
            posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
            trailerUrl: movie?.trailerUrl
        }));

      setRecommendations(moviesData)

    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get mood-based recommendations.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-headline text-2xl font-bold tracking-tight">What's Your Mood?</h2>
        <p className="text-muted-foreground">Select a mood to get instant recommendations.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => (
          <Button
            key={mood}
            variant="outline"
            className={cn(
              "transition-all",
              selectedMood === mood && "bg-accent text-accent-foreground border-accent"
            )}
            onClick={() => handleMoodSelect(mood)}
            disabled={isLoading && selectedMood === mood}
          >
            {isLoading && selectedMood === mood && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mood}
          </Button>
        ))}
      </div>
      
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[2/3] w-full bg-secondary rounded-lg animate-pulse"></div>
            ))}
        </div>
      )}
      
      {recommendations.length > 0 && selectedMood && (
        <MovieCarousel title={`For a ${selectedMood} Mood`} movies={recommendations} />
      )}
    </section>
  )
}
