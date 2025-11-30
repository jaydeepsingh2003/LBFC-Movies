
"use client";

import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { Film, PlayCircle, Bookmark } from 'lucide-react';
import { useVideoPlayer } from '@/context/video-provider';
import Link from 'next/link';
import { Button } from './ui/button';
import { useUser } from '@/firebase/auth/auth-client';
import { useToast } from '@/hooks/use-toast';
import { saveMovieToPlaylist } from '@/firebase/firestore/playlists';
import { useFirestore } from '@/firebase';
import { MovieRating } from './movie-rating';

interface MovieCardProps {
  id: number;
  title: string;
  posterUrl: string | null;
  overview?: string;
  poster_path?: string | null;
  trailerUrl?: string;
  className?: string;
  aspect?: "portrait" | "landscape";
}

export function MovieCard({ id, title, posterUrl, trailerUrl, className, aspect = "portrait", overview, poster_path }: MovieCardProps) {
  const aspectRatio = aspect === 'portrait' ? 'aspect-[2/3]' : 'aspect-video';
  const { setVideoId } = useVideoPlayer();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handlePlayTrailer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (trailerUrl) {
      const videoId = trailerUrl.split('v=')[1];
      if (videoId) {
        setVideoId(videoId);
      }
    }
  };

  const handleSaveMovie = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "Please log in",
            description: "You need to be logged in to save movies.",
        });
        return;
    }
    try {
        await saveMovieToPlaylist(firestore, user.uid, { id, title, overview: overview || '', poster_path: poster_path || null });
        toast({
            title: "Movie Saved!",
            description: `${title} has been added to your playlist.`,
        });
    } catch (error) {
        console.error("Error saving movie:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save movie. Please try again.",
        });
    }
  };

  return (
    <Link href={`/movie/${id}`} passHref>
      <Card className={cn("overflow-hidden border-none group bg-card", className)}>
        <CardContent className={cn("p-0 relative w-full", aspectRatio)}>
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <Film className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/80 hover:bg-white/20 hover:text-white"
              onClick={handleSaveMovie}
              aria-label="Save to playlist"
            >
              <Bookmark className="w-6 h-6" />
            </Button>
          </div>
          
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            {trailerUrl && (
                <PlayCircle 
                    className="w-12 h-12 text-white/80 drop-shadow-lg cursor-pointer" 
                    onClick={handlePlayTrailer}
                />
            )}
          </div>

          <div className="absolute bottom-0 left-0 p-4 w-full">
            <h3 className="font-headline text-lg font-bold text-white shadow-md ">{title}</h3>
            <div 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} 
              className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
               {user && <MovieRating movieId={id} />}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
