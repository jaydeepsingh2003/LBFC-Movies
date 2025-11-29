"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MovieCarousel } from "@/components/movie-carousel"
import { languageBasedMoviePicks } from "@/ai/flows/language-based-movie-picks"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, Globe } from "lucide-react"
import { Movie } from "@/lib/tmdb"
import { getPosterUrl, searchMovies } from "@/lib/tmdb.client"

const availableLanguages = ["English", "Spanish", "French", "Japanese", "Korean", "Hindi"];

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
      const result = await languageBasedMoviePicks({ languages: selectedLanguages });
      
      const moviePromises = result.movieRecommendations.map(title => searchMovies(title));
      const searchResults = await Promise.all(moviePromises);

      const moviesData = searchResults.map((searchResult, index) => {
        const movie = searchResult.length > 0 ? searchResult[0] : null;
        return {
          ...(movie || { title: result.movieRecommendations[index], poster_path: null, id: 0, overview: "" }),
          title: movie ? movie.title : result.movieRecommendations[index],
          posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
        }
      });
      
      setRecommendations(moviesData);
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
        <p className="text-muted-foreground">Discover movies in the languages you prefer.</p>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        {availableLanguages.map(lang => (
          <div key={lang} className="flex items-center space-x-2">
            <Checkbox
              id={`lang-${lang}`}
              checked={selectedLanguages.includes(lang)}
              onCheckedChange={() => handleLanguageChange(lang)}
            />
            <Label htmlFor={`lang-${lang}`} className="font-medium cursor-pointer">{lang}</Label>
          </div>
        ))}
      </div>
      <Button onClick={handleGetPicks} disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
        Find Movies
      </Button>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[2/3] w-full bg-secondary rounded-lg animate-pulse"></div>
            ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <MovieCarousel title={`Top Picks in ${selectedLanguages.join(', ')}`} movies={recommendations} />
      )}
    </section>
  );
}
