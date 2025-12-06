
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MovieCarousel } from "@/components/movie-carousel"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { getPosterUrl, searchMovies, getMovieVideos } from "@/lib/tmdb.client"
import { Movie } from "@/lib/tmdb"
import { Skeleton } from "../ui/skeleton"

const moods = ["Happy", "Sad", "Adventurous", "Romantic", "Thrilling", "Funny"];

const moodPlaylists: Record<string, string[]> = {
  Happy: [
    "Paddington 2", "School of Rock", "Mamma Mia!", "Little Miss Sunshine", 
    "The Lego Movie", "Singin' in the Rain", "Ferris Bueller's Day Off", "Up", 
    "Enchanted", "My Neighbor Totoro"
  ],
  Sad: [
    "Grave of the Fireflies", "Schindler's List", "The Boy in the Striped Pyjamas", 
    "Hachi: A Dog's Tale", "Manchester by the Sea", "Brokeback Mountain", 
    "Atonement", "The Green Mile", "Million Dollar Baby", "Dancer in the Dark"
  ],
  Adventurous: [
    "Indiana Jones and the Raiders of the Lost Ark", "The Lord of the Rings: The Fellowship of the Ring", 
    "Mad Max: Fury Road", "Jurassic Park", "Pirates of ahe Caribbean: The Curse of the Black Pearl", 
    "The Goonies", "Star Wars: A New Hope", "Avatar", "Jumanji: Welcome to the Jungle", "The Mummy (1999)"
  ],
  Romantic: [
    "Pride & Prejudice", "Before Sunrise", "Casablanca", "When Harry Met Sally...", 
    "The Notebook", "La La Land", "Amélie", "The Princess Bride", 
    "Notting Hill", "About Time"
  ],
  Thrilling: [
    "The Silence of the Lambs", "Zodiac", "Parasite", "Get Out", 
    "A Quiet Place", "The Fugitive", "No Country for Old Men", "Prisoners",
    "Sicario", "Seven"
  ],
  Funny: [
    "Superbad", "Booksmart", "Step Brothers", "What We Do in the Shadows", 
    "Airplane!", "Monty Python and the Holy Grail", "Shaun of the Dead", "Bridesmaids", 
    "The Grand Budapest Hotel", "Borat"
  ]
};


interface MovieWithPoster extends Movie {
    posterUrl: string | null;
}

export default function MoodSection() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<MovieWithPoster[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleMoodSelect = async (mood: string) => {
    if (selectedMood === mood) return;
    
    setSelectedMood(mood)
    setIsLoading(true)
    setRecommendations([])
    try {
      const movieTitles = moodPlaylists[mood] || [];
      
      const moviePromises = movieTitles.map(async (title) => {
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
            ...(movie || { title: movieTitles[index], poster_path: null, id: 0, overview: "" }),
            title: movie ? movie.title : movieTitles[index],
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
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] w-full bg-secondary rounded-lg animate-pulse"></div>
                ))}
            </div>
        </div>
      )}
      
      {recommendations.length > 0 && selectedMood && (
        <MovieCarousel title={`For a ${selectedMood} Mood`} movies={recommendations} />
      )}
    </section>
  )
}
