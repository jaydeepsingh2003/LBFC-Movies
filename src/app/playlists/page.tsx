'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/auth-client';
import { useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { MovieCard } from '@/components/movie-card';
import { TVShowCard } from '@/components/tv-show-card';
import { getPosterUrl, discoverMovies } from '@/lib/tmdb.client';
import type { Movie } from '@/lib/tmdb';
import { Loader2, Film, Library, Monitor, Clapperboard, LayoutGrid, Bookmark, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PlaylistsPage() {
  const { user, isLoading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const savedMoviesQuery = useMemo(() => 
    user && firestore ? collection(firestore, `users/${user.uid}/savedMovies`) : null
  , [firestore, user]);
  
  const savedTvShowsQuery = useMemo(() => 
    user && firestore ? collection(firestore, `users/${user.uid}/savedTvShows`) : null
  , [firestore, user]);
  
  const [savedMoviesSnapshot, moviesLoading] = useCollection(savedMoviesQuery);
  const [savedTvShowsSnapshot, tvLoading] = useCollection(savedTvShowsQuery);
  
  const [criteria, setCriteria] = useState({ genre: '', keywords: '' });
  const [playlistMovies, setPlaylistMovies] = useState<Movie[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCurate = async () => {
    setIsGenerating(true);
    setPlaylistMovies([]);
    try {
      // Fetch directly from TMDB based on vibe parameters (no AI involved)
      const results = await discoverMovies({
        keywords: criteria.keywords || undefined,
        sort_by: 'popularity.desc',
      });
      
      setPlaylistMovies(results.slice(0, 12));
      
      if (results.length === 0) {
        toast({
          title: 'No Matches in Archive',
          description: 'Try adjusting your vibe parameters for a different result.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Curation Link Offline',
        description: 'Could not connect to the global cinema database.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderEmptyState = (type: 'movies' | 'tv') => (
    <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[3rem] bg-secondary/10 group hover:border-primary/20 transition-colors">
      {type === 'movies' ? <Clapperboard className="mx-auto h-20 w-20 text-muted-foreground/10 group-hover:text-primary/20 transition-colors mb-6" /> : <Monitor className="mx-auto h-20 w-20 text-muted-foreground/10 group-hover:text-primary/20 transition-colors mb-6" />}
      <h3 className="text-3xl font-bold text-white tracking-tight">Vault Entry Required</h3>
      <p className="mt-3 text-muted-foreground text-lg font-medium max-w-sm mx-auto px-6">
        Click the bookmark on any {type === 'movies' ? 'film' : 'series'} to initiate your personal archive.
      </p>
      <Button asChild variant="outline" className="mt-10 rounded-full h-14 px-8 border-white/10 hover:bg-white hover:text-black font-black uppercase tracking-widest text-xs">
        <Link href={type === 'movies' ? '/' : '/tv'}>Locate {type === 'movies' ? 'Cinema' : 'Transmissions'}</Link>
      </Button>
    </div>
  );

  if (userLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-svh gap-6 bg-background">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs animate-pulse">Decrypting Personal Data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-white/5 m-8">
        <Bookmark className="h-20 w-20 text-muted-foreground/10 mb-6" />
        <h3 className="text-3xl font-bold text-white tracking-tight">Identity Verification Needed</h3>
        <p className="text-muted-foreground mt-3 text-lg font-medium text-center max-w-md px-6">
          Access to personal cinematic vaults is restricted to authenticated users.
        </p>
        <Button asChild className="mt-8 h-16 px-12 rounded-full text-xl font-black shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90">
          <Link href="/login">Establish Connection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-8 px-4 md:px-8 lg:px-12 max-w-[2000px] mx-auto min-h-screen">
      <header className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
            <Library className="size-5" />
            <span className="text-sm font-bold uppercase tracking-[0.3em]">Personal Archive</span>
        </div>
        <h1 className="font-headline text-4xl md:text-7xl font-black tracking-tighter text-white">Your <span className="text-primary">Vault</span></h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-3xl font-medium leading-relaxed">
          The epicenter of your cinematic taste. Manage saved transmissions and architect themed marathons using real-time database queries.
        </p>
      </header>

      <Tabs defaultValue="movies" className="w-full space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
            <TabsList className="bg-secondary/40 p-1 rounded-2xl h-14 w-full md:w-[450px]">
                <TabsTrigger value="movies" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all text-xs uppercase tracking-widest">
                  <Clapperboard className="mr-2 size-4"/>Saved Cinema
                </TabsTrigger>
                <TabsTrigger value="tv" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all text-xs uppercase tracking-widest">
                  <Monitor className="mr-2 size-4"/>Saved Series
                </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-4 text-muted-foreground bg-secondary/10 px-6 py-3 rounded-2xl border border-white/5">
                <LayoutGrid className="size-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Grid View Optimized</span>
            </div>
        </div>

        <TabsContent value="movies" className="mt-0">
            {moviesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 md:gap-8">
                    {[...Array(8)].map((_, i) => <div key={i} className="aspect-[2/3] w-full bg-secondary/40 rounded-3xl animate-pulse"></div>)}
                </div>
            ) : savedMoviesSnapshot?.empty ? (
                renderEmptyState('movies')
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 md:gap-8">
                    {savedMoviesSnapshot?.docs.map(doc => {
                        const movie = doc.data();
                        return (
                            <MovieCard
                                key={doc.id}
                                id={movie.id}
                                title={movie.title}
                                posterUrl={getPosterUrl(movie.poster_path)}
                                overview={movie.overview}
                                poster_path={movie.poster_path}
                            />
                        );
                    })}
                </div>
            )}
        </TabsContent>

        <TabsContent value="tv" className="mt-0">
            {tvLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 md:gap-8">
                    {[...Array(8)].map((_, i) => <div key={i} className="aspect-[2/3] w-full bg-secondary/40 rounded-3xl animate-pulse"></div>)}
                </div>
            ) : savedTvShowsSnapshot?.empty ? (
                renderEmptyState('tv')
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 md:gap-8">
                    {savedTvShowsSnapshot?.docs.map(doc => {
                        const show = doc.data();
                        return (
                            <TVShowCard
                                key={doc.id}
                                id={show.id}
                                title={show.name}
                                posterUrl={getPosterUrl(show.poster_path)}
                                overview={show.overview}
                                poster_path={show.poster_path}
                            />
                        );
                    })}
                </div>
            )}
        </TabsContent>
      </Tabs>

      <section className="pt-20 border-t border-white/5 space-y-12">
          <header className="space-y-4">
              <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                    <Search className="size-8 text-primary" />
                  </div>
                  <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter text-white uppercase">Vault Curator</h2>
              </div>
              <p className="text-muted-foreground text-lg font-medium max-w-2xl">
                  Filter the global catalog to architect a unique cinematic marathon tailored to your current preferences.
              </p>
          </header>

          <Card className="bg-gradient-to-br from-secondary/40 via-background to-background border-white/5 rounded-[3rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
            <CardContent className="p-8 md:p-16 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Vibe Parameters</label>
                        <Input 
                          value={criteria.keywords} 
                          onChange={e => setCriteria({...criteria, keywords: e.target.value})} 
                          placeholder="e.g., Cyberpunk, time travel, noir" 
                          className="h-16 bg-black/40 border-white/10 rounded-2xl text-lg font-bold focus:ring-primary/20 focus:border-primary transition-all" 
                          disabled={isGenerating}
                        />
                    </div>
                    <div className="flex items-end">
                        <Button onClick={handleCurate} disabled={isGenerating} size="lg" className="h-16 w-full md:w-auto px-12 rounded-full font-black text-lg shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 bg-white text-black hover:bg-white/90">
                            {isGenerating ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Filter className="mr-3 h-6 w-6" />}
                            Curate Marathon
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>
          
          <div className="min-h-[200px]">
              {isGenerating && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {[...Array(6)].map((_, i) => <div key={i} className="aspect-[2/3] bg-secondary/40 rounded-2xl animate-pulse"></div>)}
                  </div>
              )}

              {playlistMovies.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 md:gap-8">
                        {playlistMovies.map((movie) => (
                            <MovieCard
                                key={movie.id}
                                id={movie.id}
                                title={movie.title}
                                posterUrl={getPosterUrl(movie.poster_path)}
                                overview={movie.overview}
                                poster_path={movie.poster_path}
                            />
                        ))}
                    </div>
                  </div>
              )}
          </div>
      </section>
    </div>
  );
}
