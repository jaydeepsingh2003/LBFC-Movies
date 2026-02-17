'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Shuffle, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPosterUrl, searchMovies as searchTmdb, getMovieDetails, discoverMovies } from '@/lib/tmdb.client';
import type { Movie } from '@/lib/tmdb';
import { MovieCard } from '@/components/movie-card';

interface MovieWithPoster extends Movie {
  posterUrl: string | null;
}

export default function MovieMatchmakerSection() {
  const [movie1, setMovie1] = useState('');
  const [movie2, setMovie2] = useState('');
  const [result, setResult] = useState<MovieWithPoster | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMatch = async () => {
    if (!movie1 || !movie2) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please enter two titles to establish a cinematic bridge.',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);

    try {
      // Step 1: Search for both movies to get their IDs
      const [res1, res2] = await Promise.all([searchTmdb(movie1), searchTmdb(movie2)]);
      const m1 = res1[0];
      const m2 = res2[0];

      if (!m1 || !m2) {
          toast({ variant: "destructive", title: "Archive Signal Lost", description: "One or both titles could not be located in the vault." });
          setIsLoading(false);
          return;
      }

      // Step 2: Get detailed genres for both
      const [details1, details2] = await Promise.all([getMovieDetails(m1.id), getMovieDetails(m2.id)]);
      
      const genreIds1 = details1.genres.map(g => g.id);
      const genreIds2 = details2.genres.map(g => g.id);
      
      // Step 3: Find intersection of genres
      const commonGenres = genreIds1.filter(id => genreIds2.includes(id));
      
      // Step 4: Discover a movie that matches the "Bridge" genres
      // If no intersection, use the primary genre from each
      const searchGenreIds = commonGenres.length > 0 ? commonGenres.slice(0, 2).join(',') : `${genreIds1[0]},${genreIds2[0]}`;

      const matchedResults = await discoverMovies({
          genreId: parseInt(searchGenreIds.split(',')[0]), // Use the primary common genre
          sort_by: 'vote_count.desc',
          voteAverageGte: 7
      }, 1);

      // Step 5: Filter out the inputs and select a high-fidelity match
      const filtered = matchedResults.filter(m => m.id !== m1.id && m.id !== m2.id);
      const finalMatch = filtered[Math.floor(Math.random() * Math.min(5, filtered.length))] || filtered[0];

      if (finalMatch) {
        setResult({
            ...finalMatch,
            posterUrl: getPosterUrl(finalMatch.poster_path),
        } as MovieWithPoster);
      } else {
        toast({ title: "No Bridge Found", description: "The database could not architect a suitable cinematic link for these specific titles." });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "Connection Failed",
        description: 'Failed to process cinematic matching. Please check your network.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-4 space-y-8 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
            <Shuffle className="text-pink-500 size-6 md:size-7" />
        </div>
        <div className="space-y-1">
            <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase text-white mb-0">
                Cinematic <span className="text-pink-500">Matchmaker</span>
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Real-time genre intersection indexing to architect the perfect link between icons.</p>
        </div>
      </div>

      <Card className="border-white/5 bg-gradient-to-br from-pink-500/5 via-secondary/20 to-transparent rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
        <CardContent className="p-8 md:p-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title Alpha</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <LinkIcon className="size-4 text-pink-500/50 group-focus-within:text-pink-500 transition-colors" />
                    </div>
                    <Input
                        placeholder="e.g., Interstellar"
                        value={movie1}
                        onChange={(e) => setMovie1(e.target.value)}
                        disabled={isLoading}
                        className="h-16 pl-14 bg-background/40 border-white/10 rounded-2xl text-lg font-bold placeholder:text-muted-foreground/30 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all"
                    />
                </div>
            </div>
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title Beta</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <LinkIcon className="size-4 text-pink-500/50 group-focus-within:text-pink-500 transition-colors" />
                    </div>
                    <Input
                        placeholder="e.g., Inception"
                        value={movie2}
                        onChange={(e) => setMovie2(e.target.value)}
                        disabled={isLoading}
                        className="h-16 pl-14 bg-background/40 border-white/10 rounded-2xl text-lg font-bold placeholder:text-muted-foreground/30 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all"
                    />
                </div>
            </div>
          </div>
          <Button onClick={handleMatch} disabled={isLoading} className="w-full md:w-auto px-12 h-16 rounded-full font-black uppercase tracking-widest text-xs bg-pink-500 hover:bg-pink-600 text-white shadow-2xl shadow-pink-500/20 transition-all hover:scale-105 active:scale-95">
            {isLoading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Shuffle className="mr-3 h-6 w-6" />}
            Initialize Cinematic Link
          </Button>
        </CardContent>
      </Card>
      
      <div className="min-h-[200px]">
          {isLoading && (
            <div className="flex justify-center py-12">
                <div className="w-full max-w-xs animate-pulse space-y-4">
                    <div className="aspect-[2/3] w-full bg-secondary rounded-[2rem]"></div>
                    <div className="h-6 w-3/4 bg-secondary rounded-full mx-auto"></div>
                </div>
            </div>
          )}

          {result && (
            <div className="pt-12 animate-in fade-in zoom-in duration-1000">
              <div className="text-center space-y-2 mb-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500">Bridge Established</p>
                <h3 className="text-3xl font-headline font-black text-white uppercase tracking-tighter">The Perfect Intersection</h3>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-sm transform transition-all duration-700 hover:scale-105 hover:shadow-[0_40px_80px_rgba(236,72,153,0.2)]">
                    <MovieCard
                        id={result.id}
                        title={result.title}
                        posterUrl={result.posterUrl}
                        overview={result.overview}
                        poster_path={result.poster_path}
                    />
                </div>
              </div>
            </div>
          )}
      </div>
    </section>
  );
}
