"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Film, Star, UserCheck } from "lucide-react"
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
    if (!favoriteActors) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter an actor or director name.",
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
              const filmography = [...details.movie_credits.cast, ...details.movie_credits.crew]
                  .filter(m => m.poster_path && m.vote_count > 100)
                  .sort((a, b) => b.popularity - a.popularity)
                  .slice(0, 10);

              const movieWithMedia = await Promise.all(filmography.map(async (m) => {
                  return {
                      ...m,
                      posterUrl: getPosterUrl(m.poster_path),
                  } as MovieWithPoster;
              }));
              allCombinedMovies = [...allCombinedMovies, ...movieWithMedia];
          }
      }

      // Shuffle and unique
      const uniqueMovies = Array.from(new Map(allCombinedMovies.map(m => [m.id, m])).values());
      setRecommendations(uniqueMovies.sort(() => 0.5 - Math.random()).slice(0, 18));

      if (uniqueMovies.length === 0) {
          toast({
              variant: "destructive",
              title: "No Data Found",
              description: "We couldn't find major titles for these artists.",
          });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Link Interrupted",
        description: "Failed to fetch artist filmographies. Please try again.",
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
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">High-fidelity filmographies indexed directly from the global archive.</p>
        </div>
      </div>
      
      <Card className="border-white/5 bg-secondary/20 rounded-[2rem] overflow-hidden backdrop-blur-xl">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Artist Name (Actor or Director)</label>
            <div className="flex flex-col md:flex-row gap-4">
                <Input 
                    value={favoriteActors} 
                    onChange={e => setFavoriteActors(e.target.value)} 
                    placeholder="e.g., Christopher Nolan, Margot Robbie" 
                    className="h-14 bg-background/50 border-white/10 rounded-xl font-bold flex-1" 
                    disabled={isLoading}
                />
                <Button onClick={handleGetRecommendations} disabled={isLoading} className="rounded-xl px-10 h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Film className="mr-2 h-4 w-4" />}
                    Index Archives
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="space-y-4">
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
