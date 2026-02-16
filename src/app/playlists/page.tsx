'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/auth-client';
import { useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { MovieCard } from '@/components/movie-card';
import { getPosterUrl } from '@/lib/tmdb.client';
import { Loader2, Film, Wand2 } from 'lucide-react';
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


export default function PlaylistsPage() {
  const { user, isLoading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const savedMoviesQuery = useMemo(() => 
    user && firestore ? collection(firestore, `users/${user.uid}/savedMovies`) : null
  , [firestore, user]);
  
  const [savedMoviesSnapshot, loading, error] = useCollection(savedMoviesQuery);
  
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


  const renderContent = () => {
    if (userLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
    }

    if (!user) {
      return (
        <div className="text-center py-16">
          <h3 className="text-2xl font-bold text-foreground">Please Log In</h3>
          <p className="text-muted-foreground mt-2 mb-6">You need to be logged in to view your saved playlists.</p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => <div key={i} className="aspect-[2/3] w-full bg-secondary rounded-lg animate-pulse"></div>)}
        </div>
      );
    }

    if (error) {
      return <div className="text-center text-destructive">Error: {error.message}</div>;
    }

    if (savedMoviesSnapshot?.empty) {
      return (
        <div className="text-center py-16 border-2 border-dashed border-secondary rounded-lg">
          <Film className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Your Playlist is Empty</h3>
          <p className="mt-2 text-sm text-muted-foreground">Start by saving some movies from the home page.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
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
    );
  }

  return (
    <div className="space-y-8 py-6 px-4 md:px-8">
      <header className="space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">My Playlist</h1>
        <p className="text-muted-foreground">All your saved movies in one place.</p>
      </header>

      <div>{renderContent()}</div>

      <div className="pt-8">
          <Card>
          <CardHeader>
              <CardTitle>AI Smart Playlists</CardTitle>
              <CardDescription>Let AI create the perfect movie marathon for you based on any criteria.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                  <label htmlFor="genre" className="text-sm font-medium">Genre</label>
                  <Input id="genre" value={criteria.genre} onChange={e => setCriteria({...criteria, genre: e.target.value})} placeholder="e.g., Comedy" className="mt-1" disabled={isGenerating}/>
              </div>
              <div>
                  <label htmlFor="mood" className="text-sm font-medium">Mood</label>
                  <Input id="mood" value={criteria.mood} onChange={e => setCriteria({...criteria, mood: e.target.value})} placeholder="e.g., Heartwarming" className="mt-1" disabled={isGenerating}/>
              </div>
              <div>
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Input id="description" value={criteria.description} onChange={e => setCriteria({...criteria, description: e.target.value})} placeholder="e.g., 90s classics" className="mt-1" disabled={isGenerating}/>
              </div>
              </div>
              <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate Playlist
              </Button>
          </CardContent>
          </Card>
          
          <div className="mt-8">
              {isGenerating && (
                  <Card className="animate-pulse">
                      <CardHeader>
                          <div className="h-6 w-3/5 bg-secondary rounded"></div>
                          <div className="h-4 w-4/5 bg-secondary rounded mt-2"></div>
                      </CardHeader>
                      <CardContent>
                          <div className="space-y-2">
                              {[...Array(8)].map((_, i) => <div key={i} className="h-5 w-1/2 bg-secondary rounded"></div>)}
                          </div>
                      </CardContent>
                  </Card>
              )}

              {playlist && (
                  <Card className="bg-gradient-to-br from-accent/10 to-transparent">
                  <CardHeader>
                      <CardTitle className="font-headline text-xl text-accent flex items-center gap-2">
                          {playlist.playlistTitle}
                      </CardTitle>
                      <CardDescription>{playlist.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                          {playlist.movieTitles.map((title, index) => (
                              <div key={index} className="text-foreground p-2 bg-secondary rounded-md text-center text-sm">{title}</div>
                          ))}
                      </div>
                  </CardContent>
                  </Card>
              )}
          </div>
      </div>
    </div>
  );
}
