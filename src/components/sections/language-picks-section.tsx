"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MovieCarousel } from "@/components/movie-carousel"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Globe, Languages } from "lucide-react"
import { Movie } from "@/lib/tmdb"
import { getPosterUrl, discoverMovies } from "@/lib/tmdb.client"
import { Skeleton } from "../ui/skeleton"
import { cn } from "@/lib/utils"

const availableLanguages = [
    { name: "English", code: "en" },
    { name: "Hindi", code: "hi" },
    { name: "Tamil", code: "ta" },
    { name: "Telugu", code: "te" },
    { name: "Kannada", code: "kn" },
    { name: "Spanish", code: "es" },
    { name: "French", code: "fr" },
    { name: "Japanese", code: "ja" },
    { name: "Korean", code: "ko" },
];

interface MovieWithPoster extends Movie {
    posterUrl: string | null;
}

export default function LanguagePicksSection() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("hi");
  const [recommendations, setRecommendations] = useState<MovieWithPoster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetPicks = async (langCode: string) => {
    setSelectedLanguage(langCode);
    setIsLoading(true);
    setRecommendations([]);
    try {
      // Dynamic real-time TMDB discovery for the selected language
      const results = await discoverMovies({ 
          with_original_language: langCode,
          sort_by: 'popularity.desc',
          watch_region: 'IN'
      }, 1);
      
      const moviesWithPosters = results.map(m => ({
          ...m,
          posterUrl: getPosterUrl(m.poster_path)
      })) as MovieWithPoster[];
      
      setRecommendations(moviesWithPosters.slice(0, 18));
      
      if (moviesWithPosters.length === 0) {
          toast({
              variant: "destructive",
              title: "Archive Signal Low",
              description: "No results found for this specific linguistic category.",
          });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Transmission Failure",
        description: "Failed to connect to the global linguistic database.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger initial load for current popular language
  useEffect(() => {
    handleGetPicks("hi");
  }, []);

  return (
    <section className="py-4 space-y-8 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-400/10 rounded-lg border border-blue-400/20">
            <Languages className="size-6 md:size-7 text-blue-400" />
        </div>
        <div className="space-y-1">
            <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase text-white mb-0">
                Linguistic <span className="text-blue-400">Frontiers</span>
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Real-time global catalog indexing filtered by narrative origin and dialect.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
        {availableLanguages.map(lang => (
          <Button
            key={lang.code}
            variant="outline"
            onClick={() => handleGetPicks(lang.code)}
            className={cn(
                "rounded-full px-8 py-6 font-black uppercase tracking-widest text-[10px] border-white/5 transition-all shrink-0",
                selectedLanguage === lang.code 
                    ? 'bg-blue-400 text-black border-blue-400 scale-105 shadow-xl shadow-blue-400/30' 
                    : 'bg-secondary/20 hover:bg-white hover:text-black'
            )}
            disabled={isLoading}
          >
            {isLoading && selectedLanguage === lang.code && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            {lang.name}
          </Button>
        ))}
      </div>

      <div className="min-h-[250px]">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] w-full bg-secondary/40 rounded-2xl animate-pulse"></div>
                ))}
            </div>
          ) : recommendations.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <MovieCarousel title="" movies={recommendations} />
            </div>
          )}
      </div>
    </section>
  );
}
