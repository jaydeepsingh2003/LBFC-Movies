"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Film, Star, UserCheck, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MovieCarousel } from "../movie-carousel"
import { getPosterUrl, searchPeople, getPersonDetails, getMovieVideos } from "@/lib/tmdb.client"
import { Movie } from "@/lib/tmdb"
import { Skeleton } from "../ui/skeleton"

interface MovieWithPoster extends Movie {
  posterUrl: string | null;
}

export default function FavoriteArtistsSection() {
  const [favoriteActors, setFavoriteActors] = useState("");
  const [recommendations, setRecommendations] = useState<MovieWithPoster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    if (!favoriteActors.trim()) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter an actor or director name to begin indexing.",
      });
      return;
    }

    setIsLoading(true);
    setRecommendations([]);
    try {
      const names = favoriteActors.split(',').map(s => s.trim()).filter(Boolean);
      let allCombinedMovies: MovieWithPoster[] = [];

      for (const name of names) {
          const peopleResults = await searchPeople(name);
          const person = peopleResults.length > 0 ? peopleResults[0] : null;

          if (person) {
              const details = await getPersonDetails(person.id);
              // Filter for high-impact titles where the artist had a major role
              const filmography = [...details.movie_credits.cast, ...details.movie_credits.crew]
                  .filter(m => m.poster_path && m.vote_count > 100)
                  .sort((a, b) => b.popularity - a.popularity)
                  .slice(0, 12);

              const movieWithMedia = filmography.map((m) => {
                  return {
                      ...m,
                      posterUrl: getPosterUrl(m.poster_path),
                  } as MovieWithPoster;
              });
              allCombinedMovies = [...allCombinedMovies, ...movieWithMedia];
          }
      }

      // Unique by ID and shuffle for dynamic feel
      const uniqueMovies = Array.from(new Map(allCombinedMovies.map(m => [m.id, m])).values());
      const shuffled = uniqueMovies.sort(() => 0.5 - Math.random()).slice(0, 18);
      
      setRecommendations(shuffled);

      if (shuffled.length === 0) {
          toast({
              variant: "destructive",
              title: "Archive Mismatch",
              description: "We couldn't locate major cinematic works for this individual.",
          });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Indexing Error",
        description: "Failed to connect to the personnel archives. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-4 space-y-8 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <UserCheck className="text-primary size-6 md:size-7" />
        </div>
        <div className="space-y-1">
            <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase text-white mb-0">
                Talent <span className="text-primary">Spotlight</span>
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Real-time filmography indexing direct from global personnel records.</p>
        </div>
      </div>
      
      <Card className="border-white/5 bg-secondary/20 rounded-[2rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Artist (Actor or Director)</label>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                        value={favoriteActors} 
                        onChange={e => setFavoriteActors(e.target.value)} 
                        placeholder="e.g., Christopher Nolan, Scarlett Johansson" 
                        className="h-16 pl-14 bg-background/50 border-white/10 rounded-2xl text-lg font-bold placeholder:text-muted-foreground/30 focus:ring-primary/20 focus:border-primary/50 transition-all" 
                        disabled={isLoading}
                    />
                </div>
                <Button onClick={handleGetRecommendations} disabled={isLoading} className="rounded-2xl px-10 h-16 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95">
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Film className="mr-2 h-5 w-5" />}
                    Index Filmography
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="min-h-[200px]">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] w-full bg-secondary/40 rounded-2xl animate-pulse"></div>
                ))}
            </div>
          ) : recommendations.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <MovieCarousel title="Artist Archive Selections" movies={recommendations} />
            </div>
          )}
      </div>
    </section>
  )
}
