
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getFavoriteArtistsDirectorsRecommendations } from "@/ai/flows/favorite-artists-directors"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Film } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MovieCarousel } from "../movie-carousel"
import { getPosterUrl, searchMovies, getMovieVideos } from "@/lib/tmdb.client"
import { Movie } from "@/lib/tmdb"

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

      const result = await getFavoriteArtistsDirectorsRecommendations({ 
        favoriteActors: actors,
        favoriteDirectors: directors 
      });
      
      const moviePromises = result.recommendations.map(async (title) => {
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
          ...(movie || { title: result.recommendations[index], poster_path: null, id: 0, overview: "" }),
          title: movie ? movie.title : result.recommendations[index],
          posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
          trailerUrl: movie?.trailerUrl
        }));
      
      setRecommendations(moviesData);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get recommendations. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-headline text-2xl font-bold tracking-tight">From Your Favorites</h2>
        <p className="text-muted-foreground">Get recommendations based on actors and directors you love.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Find Movies by Artists</CardTitle>
          <CardDescription>Enter your favorite actors or directors, separated by commas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="actors" className="text-sm font-medium">Favorite Actors</label>
              <Input 
                id="actors" 
                value={favoriteActors} 
                onChange={e => setFavoriteActors(e.target.value)} 
                placeholder="e.g., Tom Hanks, Meryl Streep" 
                className="mt-1" 
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="directors" className="text-sm font-medium">Favorite Directors</label>
              <Input 
                id="directors" 
                value={favoriteDirectors} 
                onChange={e => setFavoriteDirectors(e.target.value)} 
                placeholder="e.g., Christopher Nolan, Greta Gerwig" 
                className="mt-1" 
                disabled={isLoading}
              />
            </div>
          </div>
          <Button onClick={handleGetRecommendations} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Film className="mr-2 h-4 w-4" />}
            Get Recommendations
          </Button>
        </CardContent>
      </Card>
      
      {isLoading && (
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[2/3] w-full bg-secondary rounded-lg animate-pulse"></div>
            ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <MovieCarousel title="Based on Your Favorites" movies={recommendations} />
      )}
    </section>
  )
}
