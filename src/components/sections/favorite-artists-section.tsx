"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getFavoriteArtistsDirectorsRecommendations } from "@/ai/flows/favorite-artists-directors"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Film, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
              description: "Could not fetch movie details for these artists.",
          });
      }

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
    <section className="py-12 space-y-8 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Star className="text-primary size-6 md:size-7 fill-primary" />
        </div>
        <div className="space-y-1">
            <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase text-white mb-0">
                Talent <span className="text-primary">Spotlight</span>
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Discover curated titles based on your favorite actors and directors.</p>
        </div>
      </div>
      
      <Card className="border-white/5 bg-secondary/20 rounded-[2rem] overflow-hidden backdrop-blur-xl">
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Favorite Actors</label>
              <Input 
                value={favoriteActors} 
                onChange={e => setFavoriteActors(e.target.value)} 
                placeholder="e.g., Tom Hanks, Meryl Streep" 
                className="h-14 bg-background/50 border-white/10 rounded-xl font-bold" 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Favorite Directors</label>
              <Input 
                value={favoriteDirectors} 
                onChange={e => setFavoriteDirectors(e.target.value)} 
                placeholder="e.g., Christopher Nolan, Greta Gerwig" 
                className="h-14 bg-background/50 border-white/10 rounded-xl font-bold" 
                disabled={isLoading}
              />
            </div>
          </div>
          <Button onClick={handleGetRecommendations} disabled={isLoading} className="rounded-full px-10 h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Film className="mr-2 h-4 w-4" />}
            Get Recommendations
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <MovieCarousel title="Artist-Based Selections" movies={recommendations} />
        </div>
      )}
    </section>
  )
}
