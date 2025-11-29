"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MovieCarousel } from "@/components/movie-carousel"
import { getFavoriteArtistsDirectorsRecommendations } from "@/ai/flows/favorite-artists-directors"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Movie } from "@/lib/tmdb"
import { getPosterUrl, searchMovies } from "@/lib/tmdb.client"

const artists = [
  { type: 'actor', name: 'Tom Hanks' },
  { type: 'actor', name: 'Meryl Streep' },
  { type: 'director', name: 'Christopher Nolan' },
  { type: 'director', name: 'Greta Gerwig' },
  { type: 'actor', name: 'Denzel Washington' },
  { type: 'director', name: 'Spike Lee' },
];

interface MovieWithPoster extends Movie {
    posterUrl: string | null;
}

export default function FavoriteArtistsSection() {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<MovieWithPoster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendations = async (artist: { type: string, name: string }) => {
    setSelectedArtist(artist.name);
    setIsLoading(true);
    setRecommendations([]);
    try {
      const input = {
        favoriteActors: artist.type === 'actor' ? [artist.name] : [],
        favoriteDirectors: artist.type === 'director' ? [artist.name] : [],
      };
      const result = await getFavoriteArtistsDirectorsRecommendations(input);
      
      const moviePromises = result.recommendations.map(title => searchMovies(title));
      const searchResults = await Promise.all(moviePromises);

      const moviesData = searchResults.map((searchResult, index) => {
        const movie = searchResult.length > 0 ? searchResult[0] : null;
        return {
          ...(movie || { title: result.recommendations[index], poster_path: null, id: 0, overview: "" }),
          title: movie ? movie.title : result.recommendations[index],
          posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
        }
      });

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
      <div className="flex flex-wrap gap-2">
        {artists.map((artist) => (
          <Button
            key={artist.name}
            variant="outline"
            className={cn(
              "transition-all",
              selectedArtist === artist.name && "bg-accent text-accent-foreground border-accent"
            )}
            onClick={() => handleGetRecommendations(artist)}
            disabled={isLoading && selectedArtist === artist.name}
          >
            {isLoading && selectedArtist === artist.name && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {artist.name}
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

      {recommendations.length > 0 && selectedArtist && (
        <MovieCarousel title={`Because you like ${selectedArtist}`} movies={recommendations} />
      )}
    </section>
  )
}
