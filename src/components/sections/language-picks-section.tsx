
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MovieCarousel } from "@/components/movie-carousel"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, Globe } from "lucide-react"
import { Movie } from "@/lib/tmdb"
import { getPosterUrl, searchMovies, getMovieVideos } from "@/lib/tmdb.client"
import { Skeleton } from "../ui/skeleton"
import { languageBasedMoviePicks } from "@/ai/flows/language-based-movie-picks"

const availableLanguages = ["English", "Spanish", "French", "Japanese", "Korean", "Hindi", "Kannada", "German"];

interface MovieWithPoster extends Movie {
    posterUrl: string | null;
}

export default function LanguagePicksSection() {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
  const [recommendations, setRecommendations] = useState<MovieWithPoster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLanguageChange = (language: string) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(lang => lang !== language)
        : [...prev, language]
    );
  };

  const handleGetPicks = async () => {
    if (selectedLanguages.length === 0) {
      toast({
        variant: "destructive",
        title: "No Language Selected",
        description: "Please select at least one language.",
      });
      return;
    }
    setIsLoading(true);
    setRecommendations([]);
    try {
      // Call AI flow to get relevant movie titles for the selected languages
      const result = await languageBasedMoviePicks({ 
          languages: selectedLanguages,
          numberOfRecommendations: 12
      });
      
      const movieTitles = result.movieRecommendations;
      
      // Fetch full TMDB data for these titles
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
      
      setRecommendations(moviesData);
      
      if (moviesData.length === 0) {
          toast({
              variant: "destructive",
              title: "Search failed",
              description: "Could not find movies matching these languages.",
          });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get language-based picks. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-headline text-2xl font-bold tracking-tight">Picks In Your Language</h2>
        <p className="text-muted-foreground">Discover top-rated movies in the languages you prefer.</p>
      </div>
      <div className="flex flex-wrap gap-4 items-center bg-secondary/30 p-4 rounded-xl border border-white/5">
        {availableLanguages.map(lang => (
          <div key={lang} className="flex items-center space-x-2">
            <Checkbox
              id={`lang-${lang}`}
              checked={selectedLanguages.includes(lang)}
              onCheckedChange={() => handleLanguageChange(lang)}
            />
            <Label htmlFor={`lang-${lang}`} className="font-medium cursor-pointer text-sm">{lang}</Label>
          </div>
        ))}
      </div>
      <Button onClick={handleGetPicks} disabled={isLoading} className="rounded-full px-8">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
        Find Movies
      </Button>

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
        <MovieCarousel title={`Top Picks in ${selectedLanguages.join(', ')}`} movies={recommendations} />
      )}
    </section>
  );
}
