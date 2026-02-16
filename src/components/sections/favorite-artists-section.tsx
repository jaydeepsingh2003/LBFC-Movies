
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getFavoriteArtistsDirectorsRecommendations } from "@/ai/flows/favorite-artists-directors"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Film, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MovieCarousel } from "../movie-carousel"
import { getPosterUrl, searchMovies, getMovieVideos } from "@/lib/tmdb.client"
import { Movie } from "@/lib/tmdb"
import { Skeleton } from "../ui/skeleton"

interface MovieWithPoster extends Movie {
  posterUrl: string | null;
}

export default function FavoriteArtistsSection() {
  const [favoriteActors, setFavoriteActors] = useState("");
  const [favoriteDirectors, setFavoriteDirectors] = useState("");
  const [recommendations, setRecommendations] = useState<MovieWithPoster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    if (!favoriteActors && !favoriteDirectors) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter at least one actor or director.",
      });
      return;
    }

    setIsLoading(true);
    setRecommendations([]);
    try {
      const actors = favoriteActors.split(',').map(s => s.trim()).filter(Boolean);
      const directors = favoriteDirectors.split(',').map(s => s.trim()).filter(Boolean);

      // AI generates relevant titles based on input artists
      const result = await getFavoriteArtistsDirectorsRecommendations({ 
        favoriteActors: actors,
        favoriteDirectors: directors 
      });
      
      // Fetch full TMDB records for each recommendation
      const moviePromises = result.recommendations.map(async (title) => {
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
      
      setRecommendations(moviesData);

      if (moviesData.length === 0) {
          toast({
              variant: "destructive",
              title: "No data found",
              description: "Could not fetch movie details from TMDB.",
          });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get recommendations from TMDB. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-headline text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="text-primary size-6" />
            From Your Favorites
        </h2>
        <p className="text-muted-foreground">Get recommendations from the TMDB catalog based on actors and directors you love.</p>
      </div>
      
      <Card className="border-white/5 bg-secondary/20">
        <CardHeader>
          <CardTitle>Find Movies by Artists</CardTitle>
          <CardDescription>Enter your favorite stars or directors to discover their work on TMDB.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="actors" className="text-sm font-medium text-muted-foreground">Favorite Actors</label>
              <Input 
                id="actors" 
                value={favoriteActors} 
                onChange={e => setFavoriteActors(e.target.value)} 
                placeholder="e.g., Tom Hanks, Meryl Streep" 
                className="mt-1.5" 
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="directors" className="text-sm font-medium text-muted-foreground">Favorite Directors</label>
              <Input 
                id="directors" 
                value={favoriteDirectors} 
                onChange={e => setFavoriteDirectors(e.target.value)} 
                placeholder="e.g., Christopher Nolan, Greta Gerwig" 
                className="mt-1.5" 
                disabled={isLoading}
              />
            </div>
          </div>
          <Button onClick={handleGetRecommendations} disabled={isLoading} className="rounded-full px-8">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Film className="mr-2 h-4 w-4" />}
            Get TMDB Recommendations
          </Button>
        </CardContent>
      </Card>
      
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

      {recommendations.length > 0 && (
        <MovieCarousel title="Based on Your Favorites" movies={recommendations} />
      )}
    </section>
  )
}
