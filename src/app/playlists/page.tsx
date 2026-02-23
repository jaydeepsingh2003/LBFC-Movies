
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
import { Loader2, Film, Library, Monitor, Clapperboard, LayoutGrid, Bookmark, Search, Filter, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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
    <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[4rem] bg-secondary/10 group hover:border-primary/20 transition-all duration-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl" />
      <div className="relative z-10">
        {type === 'movies' ? <Clapperboard className="mx-auto h-24 w-24 text-muted-foreground/5 group-hover:text-primary/10 transition-all duration-700 mb-8" /> : <Monitor className="mx-auto h-24 w-24 text-muted-foreground/5 group-hover:text-primary/10 transition-all duration-700 mb-8" />}
        <h3 className="text-4xl font-black text-white tracking-tighter uppercase">Vault Entry Required</h3>
        <p className="mt-4 text-muted-foreground text-xl font-medium max-w-sm mx-auto px-10 leading-relaxed opacity-60">
          Initialize your personal archive by bookmarking a {type === 'movies' ? 'cinematic work' : 'series sequence'} from the global catalog.
        </p>
        <Button asChild variant="outline" className="mt-12 rounded-2xl h-16 px-12 border-white/10 hover:bg-white hover:text-black font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all hover:scale-105 active:scale-95">
          <Link href={type === 'movies' ? '/' : '/tv'}>Locate {type === 'movies' ? 'Cinema' : 'Transmissions'}</Link>
        </Button>
      </div>
    </div>
  );

  if (userLoading || !user) {
    return (
      <div className="flex flex-col justify-center items-center h-svh gap-6 bg-transparent">
        <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">Decrypting Personal Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-24 py-12 px-4 md:px-8 lg:px-12 max-w-[2000px] mx-auto min-h-screen">
      <header className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
                <Library className="size-6" />
                <span className="text-sm font-black uppercase tracking-[0.4em]">Personal Archive</span>
            </div>
            <h1 className="font-headline text-4xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">Your <span className="text-primary">Vault</span></h1>
            <p className="text-muted-foreground text-lg md:text-2xl max-w-3xl font-medium leading-relaxed opacity-80">
              The epicenter of your cinematic identity. Architect themed marathons and manage high-fidelity transmissions.
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-secondary/20 border border-white/5 p-6 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Bookmark className="size-8 text-primary" />
              </div>
              <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black uppercase tracking-tighter text-white leading-none">Master Index</p>
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px] font-black uppercase py-0.5">Verified Archive</Badge>
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="size-3" /> User Cryptographic Sync: Active
                  </p>
              </div>
          </div>
        </div>
      </header>

      <Tabs defaultValue="movies" className="w-full space-y-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-white/5 pb-10">
            <TabsList className="bg-secondary/40 p-1.5 rounded-2xl h-16 w-full md:w-[500px] border border-white/5 shadow-2xl backdrop-blur-xl">
                <TabsTrigger value="movies" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                  <Clapperboard className="mr-2 size-4"/>Saved Cinema
                </TabsTrigger>
                <TabsTrigger value="tv" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                  <Monitor className="mr-2 size-4"/>Saved Series
                </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-4 text-muted-foreground bg-secondary/10 px-8 py-4 rounded-2xl border border-white/5 shadow-xl">
                <LayoutGrid className="size-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Grid View Optimized</span>
            </div>
        </div>

        <TabsContent value="movies" className="mt-0 outline-none">
            {moviesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-10">
                    {[...Array(8)].map((_, i) => <div key={i} className="aspect-[2/3] w-full bg-secondary/40 rounded-[2rem] animate-pulse"></div>)}
                </div>
            ) : savedMoviesSnapshot?.empty ? (
                renderEmptyState('movies')
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-10 animate-in fade-in duration-1000">
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

        <TabsContent value="tv" className="mt-0 outline-none">
            {tvLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-10">
                    {[...Array(8)].map((_, i) => <div key={i} className="aspect-[2/3] w-full bg-secondary/40 rounded-[2rem] animate-pulse"></div>)}
                </div>
            ) : savedTvShowsSnapshot?.empty ? (
                renderEmptyState('tv')
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-10 animate-in fade-in duration-1000">
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

      <section className="pt-24 border-t border-white/5 space-y-16">
          <header className="space-y-6">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-[2rem] border border-primary/20 shadow-2xl">
                    <Search className="size-10 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-headline text-3xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none">Vault <span className="text-primary">Curator</span></h2>
                    <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">AI-powered architectural indexer for custom cinematic marathons.</p>
                  </div>
              </div>
          </header>

          <Card className="bg-gradient-to-br from-secondary/40 via-background to-background border-white/5 rounded-[4rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.6)] backdrop-blur-3xl relative group">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="size-64" />
            </div>
            <CardContent className="p-10 md:p-20 space-y-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:items-end">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="flex items-center gap-2 ml-2">
                            <Zap className="size-3 text-primary" />
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Atmospheric Vibe Parameters</label>
                        </div>
                        <Input 
                          value={criteria.keywords} 
                          onChange={e => setCriteria({...criteria, keywords: e.target.value})} 
                          placeholder="e.g., Deep Space, Noir Detective, Cyberpunk 2077" 
                          className="h-20 bg-black/40 border-white/10 rounded-[2rem] text-2xl font-black uppercase tracking-tighter placeholder:text-muted-foreground/20 focus:ring-primary/20 focus:border-primary transition-all px-10 shadow-inner" 
                          disabled={isGenerating}
                        />
                    </div>
                    <div>
                        <Button 
                            onClick={handleCurate} 
                            disabled={isGenerating} 
                            size="lg" 
                            className="h-20 w-full rounded-full font-black text-xl shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 bg-white text-black hover:bg-white/90 uppercase tracking-widest"
                        >
                            {isGenerating ? <Loader2 className="mr-4 h-8 w-8 animate-spin" /> : <Filter className="mr-4 h-8 w-8" />}
                            Index Marathon
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>
          
          <div className="min-h-[300px] relative">
              {isGenerating && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10">
                      {[...Array(6)].map((_, i) => (
                          <div key={i} className="aspect-[2/3] bg-secondary/40 rounded-[2rem] animate-pulse"></div>
                      ))}
                  </div>
              )}

              {playlistMovies.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 space-y-10">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                        <div className="size-2 bg-primary rounded-full animate-pulse" />
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">Results Indexed for: "{criteria.keywords}"</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-10">
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
