'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateSmartPlaylist } from '@/ai/flows/smart-playlists';
import type { SmartPlaylistOutput } from '@/ai/flows/smart-playlists';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ListPlus, Wand2 } from 'lucide-react';

export default function PlaylistsPage() {
  const [criteria, setCriteria] = useState({ genre: 'Sci-Fi', mood: 'Thought-provoking', description: 'movies about AI' });
  const [playlist, setPlaylist] = useState<SmartPlaylistOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setPlaylist(null);
    try {
      const result = await generateSmartPlaylist({ ...criteria, playlistLength: 12 });
      setPlaylist(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Playlist Generation Failed',
        description: 'Could not generate a smart playlist. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout showSidebar={false}>
      <div className="p-4 sm:p-6 md:p-8">
        <header className="space-y-2 mb-8">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">AI Smart Playlists</h1>
          <p className="text-muted-foreground">Let AI create the perfect movie marathon for you.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Create a Playlist</CardTitle>
            <CardDescription>Enter any combination of criteria below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="genre" className="text-sm font-medium">Genre</label>
                <Input id="genre" value={criteria.genre} onChange={e => setCriteria({...criteria, genre: e.target.value})} placeholder="e.g., Comedy" className="mt-1" disabled={isLoading}/>
              </div>
              <div>
                <label htmlFor="mood" className="text-sm font-medium">Mood</label>
                <Input id="mood" value={criteria.mood} onChange={e => setCriteria({...criteria, mood: e.target.value})} placeholder="e.g., Heartwarming" className="mt-1" disabled={isLoading}/>
              </div>
              <div>
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Input id="description" value={criteria.description} onChange={e => setCriteria({...criteria, description: e.target.value})} placeholder="e.g., 90s classics" className="mt-1" disabled={isLoading}/>
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate Playlist
            </Button>
          </CardContent>
        </Card>
        
        <div className="mt-8">
            {isLoading && (
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
                        <ListPlus /> {playlist.playlistTitle}
                    </CardTitle>
                    <CardDescription>{playlist.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-1">
                    {playlist.movieTitles.map((title, index) => (
                        <li key={index} className="text-foreground">{title}</li>
                    ))}
                    </ul>
                </CardContent>
                </Card>
            )}
        </div>
      </div>
    </AppLayout>
  );
}
