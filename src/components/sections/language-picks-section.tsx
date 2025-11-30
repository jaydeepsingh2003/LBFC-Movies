
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

const availableLanguages = ["English", "Spanish", "French", "Japanese", "Korean", "Hindi", "Kannada"];

const languagePlaylists: Record<string, string[]> = {
  English: [
    "The Shawshank Redemption", "The Dark Knight", "Forrest Gump", "Pulp Fiction",
    "Inception", "The Matrix", "Goodfellas", "The Lord of the Rings: The Fellowship of the Ring",
    "Fight Club", "Gladiator"
  ],
  Spanish: [
    "Pan's Labyrinth", "The Secret in Their Eyes", "Amores perros", "Y tu mamá también",
    "Roma", "Wild Tales", "The Sea Inside", "All About My Mother",
    "The Motorcycle Diaries", "The Platform"
  ],
  French: [
    "Amélie", "The Intouchables", "La Haine", "Portrait of a Lady on Fire",
    "Blue Is the Warmest Colour", "The 400 Blows", "Breathless", "Le Dîner de Cons",
    "A Prophet", "Rust and Bone"
  ],
  Japanese: [
    "Spirited Away", "Seven Samurai", "Your Name.", "My Neighbor Totoro",
    "Akira", "Grave of the Fireflies", "Princess Mononoke", "Battle Royale",
    "Drive My Car", "Shoplifters"
  ],
  Korean: [
    "Parasite", "Oldboy", "Train to Busan", "The Handmaiden",
    "Memories of Murder", "Burning", "The Wailing", "I Saw the Devil",
    "A Taxi Driver", "The Man from Nowhere"
  ],
  Hindi: [
    "3 Idiots", "Dangal", "Lagaan", "Sholay", "Dilwale Dulhania Le Jayenge",
    "Zindagi Na Milegi Dobara", "Gangs of Wasseypur", "Taare Zameen Par",
    "Andhadhun", "Barfi!"
  ],
  Kannada: [
    "K.G.F: Chapter 1", "Kantara", "Kirik Party", "Mungaru Male", "Ulidavaru Kandanthe",
    "Lucia", "Thithi", "Rangitaranga", "Garuda Gamana Vrishabha Vahana", "777 Charlie"
  ]
};


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
      const movieTitles = selectedLanguages.flatMap(lang => languagePlaylists[lang] || []);
      const uniqueMovieTitles = Array.from(new Set(movieTitles));
      
      const moviePromises = uniqueMovieTitles.map(async (title) => {
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
          ...(movie || { title: uniqueMovieTitles[index], poster_path: null, id: 0, overview: "" }),
          title: movie ? movie.title : uniqueMovieTitles[index],
          posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
          trailerUrl: movie?.trailerUrl
        }));
      
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
