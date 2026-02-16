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
import { Loader2, Film, Wand2, Monitor, Clapperboard } from 'lucide-react';
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
  
  const [criteria, setCriteria] = useState({ genre: 'Sci-Fi', mood: 'Thought-provoking', description: 'movies about AI' });
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
        title: 'Playlist Generation Failed',
        description: 'Could not generate a smart playlist. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderEmptyState = (type: 'movies' | 'tv') => (
    <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-secondary/10">
      {type === 'movies' ? <Clapperboard className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" /> : <Monitor className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />}
      <h3 className="text-2xl font-bold text-white tracking-tight">Your {type === 'movies' ? 'Movie' : 'TV'} Vault is Empty</h3>
      <p className="mt-3 text-muted-foreground text-lg font-medium max-w-sm mx-auto">
        Start building your collection by clicking the bookmark icon on any {type === 'movies' ? 'movie' : 'series'}.
      </p>
      <Button asChild variant="outline" className="mt-8 rounded-full border-white/10 hover:bg-white hover:text-black">
        <Link href={type === 'movies' ? '/' : '/tv'}>Discover {type === 'movies' ? 'Movies' : 'Shows'}</Link>
      </Button>
    </div>
  );

  if (userLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs animate-pulse">Accessing Secure Archives...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-white/5 m-8">
        <Film className="h-20 w-20 text-muted-foreground/10 mb-6" />
        <h3 className="text-3xl font-bold text-white tracking-tight">Access Restricted</h3>
        <p className="text-muted-foreground mt-3 text-lg font-medium text-center max-w-md px-6">
          Sign in to curate and access your personal movie and TV vaults.
        </p>
        <Button asChild className="mt-8 h-14 px-10 rounded-full text-lg font-black shadow-2xl shadow-primary/20">
          <Link href="/login">Sign In Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-8 px-4 md:px-8 lg:px-12 max-w-[2000px] mx-auto min-h-screen">
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
            <Film className="size-5" />
            <span className="text-sm font-bold uppercase tracking-[0.2em]">Curated Collection</span>
        </div>
        <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-white">Your Playlist</h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium leading-relaxed">
          Manage your saved titles and use AI to generate themed marathons based on your mood.
        </p>
      </header>

      <Tabs defaultValue="movies" className="w-full space-y-10">
        <TabsList className="bg-secondary/40 p-1 rounded-2xl h-14 w-full md:w-[400px]">
            <TabsTrigger value="movies" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">
              <Clapperboard className="mr-2 size-4"/>Movies
            </TabsTrigger>
            <TabsTrigger value="tv" className="rounded-xl h-full flex-1 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">
              <Monitor className="mr-2 size-4"/>TV Shows
            </TabsTrigger>
        </TabsList>

        <TabsContent value="movies" className="mt-0">
            {moviesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
                    {[...Array(7)].map((_, i) => <div key={i} className="aspect-[2/3] w-full bg-secondary/40 rounded-xl animate-pulse"></div>)}
                </div>
            ) : savedMoviesSnapshot?.empty ? (
                renderEmptyState('movies')
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
                    {[...Array(7)].map((_, i) => <div key={i} className="aspect-[2/3] w-full bg-secondary/40 rounded-xl animate-pulse"></div>)}
                </div>
            ) : savedTvShowsSnapshot?.empty ? (
                renderEmptyState('tv')
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
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

      <div className="pt-12 border-t border-white/5">
          <Card className="bg-gradient-to-br from-secondary/40 to-background border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <Wand2 className="size-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-headline font-bold">AI Smart Playlists</CardTitle>
                    <CardDescription className="text-lg">Let AI architect the perfect cinematic marathon for you.</CardDescription>
                  </div>
              </div>
          </CardHeader>
          <CardContent className="p-8 md:p-12 pt-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                    <label htmlFor="genre" className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Genre</label>
                    <Input id="genre" value={criteria.genre} onChange={e => setCriteria({...criteria, genre: e.target.value})} placeholder="e.g., Cyberpunk" className="h-14 bg-black/40 border-white/10 rounded-xl" disabled={isGenerating}/>
                </div>
                <div className="space-y-3">
                    <label htmlFor="mood" className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Mood</label>
                    <Input id="mood" value={criteria.mood} onChange={e => setCriteria({...criteria, mood: e.target.value})} placeholder="e.g., Existential" className="h-14 bg-black/40 border-white/10 rounded-xl" disabled={isGenerating}/>
                </div>
                <div className="space-y-3">
                    <label htmlFor="description" className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                    <Input id="description" value={criteria.description} onChange={e => setCriteria({...criteria, description: e.target.value})} placeholder="e.g., movies like Blade Runner" className="h-14 bg-black/40 border-white/10 rounded-xl" disabled={isGenerating}/>
                </div>
              </div>
              <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="h-14 px-10 rounded-full font-black text-lg shadow-xl shadow-primary/20">
                {isGenerating ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Wand2 className="mr-3 h-6 w-6" />}
                Generate Dynamic Playlist
              </Button>
          </CardContent>
          </Card>
          
          <div className="mt-12">
              {isGenerating && (
                  <Card className="rounded-[2rem] bg-secondary/20 animate-pulse border-none">
                      <CardHeader className="p-12">
                          <div className="h-10 w-1/3 bg-white/5 rounded-lg mb-4"></div>
                          <div className="h-6 w-2/3 bg-white/5 rounded-lg"></div>
                      </CardHeader>
                      <CardContent className="px-12 pb-12">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              {[...Array(10)].map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-xl"></div>)}
                          </div>
                      </CardContent>
                  </Card>
              )}

              {playlist && (
                  <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 rounded-[2rem] shadow-2xl">
                        <CardHeader className="p-12">
                            <CardTitle className="font-headline text-4xl text-white mb-4">
                                {playlist.playlistTitle}
                            </CardTitle>
                            <CardDescription className="text-xl text-muted-foreground font-medium leading-relaxed italic border-l-4 border-primary pl-6">
                                {playlist.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-12 pb-12">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                {playlist.movieTitles.map((title, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                                        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs group-hover:bg-primary group-hover:text-white transition-colors">
                                            {index + 1}
                                        </div>
                                        <span className="font-bold text-white/90 line-clamp-1">{title}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
