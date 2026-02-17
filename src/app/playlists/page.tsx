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
import { getPosterUrl } from '@/lib/tmdb.client';
import { Loader2, Film, Wand2, Monitor, Clapperboard, Sparkles, LayoutGrid, Bookmark } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateSmartPlaylist, type SmartPlaylistOutput } from '@/ai/flows/smart-playlists';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

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
  
  const [criteria, setCriteria] = useState({ genre: 'Cyberpunk', mood: 'Existential', description: 'movies like Blade Runner' });
  const [playlist, setPlaylist] = useState<SmartPlaylistOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setPlaylist(null);
    try {
      const result = await generateSmartPlaylist({ ...criteria, playlistLength: 10 });
      setPlaylist(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Architectural Failure',
        description: 'The AI could not curate your request. Check your connectivity.',
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
            <Sparkles className="size-5" />
            <span className="text-sm font-bold uppercase tracking-[0.3em]">Intelligence Core</span>
        </div>
        <h1 className="font-headline text-4xl md:text-7xl font-black tracking-tighter text-white">Your <span className="text-primary">Vault</span></h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-3xl font-medium leading-relaxed">
          The epicenter of your cinematic taste. Manage saved transmissions and deploy AI agents to architect themed playlists.
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
                    <Wand2 className="size-8 text-primary" />
                  </div>
                  <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter text-white uppercase">AI Curator</h2>
              </div>
              <p className="text-muted-foreground text-lg font-medium max-w-2xl">
                  Describe a feeling, a vibe, or a hyper-specific genre to let our AI architect a unique cinematic marathon.
              </p>
          </header>

          <Card className="bg-gradient-to-br from-secondary/40 via-background to-background border-white/5 rounded-[3rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
            <CardContent className="p-8 md:p-16 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Genre Selection</label>
                        <Input value={criteria.genre} onChange={e => setCriteria({...criteria, genre: e.target.value})} placeholder="e.g., Cyberpunk" className="h-16 bg-black/40 border-white/10 rounded-2xl text-lg font-bold focus:ring-primary/20 focus:border-primary transition-all" disabled={isGenerating}/>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Atmospheric Mood</label>
                        <Input value={criteria.mood} onChange={e => setCriteria({...criteria, mood: e.target.value})} placeholder="e.g., Existential" className="h-16 bg-black/40 border-white/10 rounded-2xl text-lg font-bold focus:ring-primary/20 focus:border-primary transition-all" disabled={isGenerating}/>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Vibe Parameters</label>
                        <Input value={criteria.description} onChange={e => setCriteria({...criteria, description: e.target.value})} placeholder="e.g., movies like Blade Runner" className="h-16 bg-black/40 border-white/10 rounded-2xl text-lg font-bold focus:ring-primary/20 focus:border-primary transition-all" disabled={isGenerating}/>
                    </div>
                </div>
                <div className="flex justify-center md:justify-start">
                    <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="h-16 px-12 rounded-full font-black text-lg shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 bg-white text-black hover:bg-white/90">
                        {isGenerating ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Sparkles className="mr-3 h-6 w-6" />}
                        Generate Intelligence Playlist
                    </Button>
                </div>
            </CardContent>
          </Card>
          
          <div className="min-h-[200px]">
              {isGenerating && (
                  <Card className="rounded-[3rem] bg-secondary/10 animate-pulse border-none p-12">
                      <div className="h-12 w-1/2 bg-white/5 rounded-2xl mb-8"></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                          {[...Array(10)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-2xl"></div>)}
                      </div>
                  </Card>
              )}

              {playlist && (
                  <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <Card className="bg-gradient-to-br from-primary/20 via-background to-background border-primary/20 rounded-[3rem] shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 size-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                        <CardHeader className="p-10 md:p-16 space-y-6 relative z-10">
                            <CardTitle className="font-headline text-4xl md:text-6xl text-white font-black tracking-tighter uppercase">
                                {playlist.playlistTitle}
                            </CardTitle>
                            <CardDescription className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed italic border-l-4 border-primary pl-8 max-w-4xl">
                                "{playlist.description}"
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 md:px-16 pb-16 relative z-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                {playlist.movieTitles.map((title, index) => (
                                    <div key={index} className="flex items-center gap-5 p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-primary/30 transition-all group shadow-xl">
                                        <div className="size-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black text-xs group-hover:bg-primary group-hover:text-white transition-all shadow-lg">
                                            {String(index + 1).padStart(2, '0')}
                                        </div>
                                        <span className="font-black text-sm lg:text-lg text-white group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">{title}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                  </div>
              )}
          </div>
      </section>
    </div>
  );
}
