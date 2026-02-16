"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Film, Play, Bookmark, Star, Info } from 'lucide-react';
import { useVideoPlayer } from '@/context/video-provider';
import Link from 'next/link';
import { Button } from './ui/button';
import { useUser } from '@/firebase/auth/auth-client';
import { useToast } from '@/hooks/use-toast';
import { saveMovieToPlaylist } from '@/firebase/firestore/playlists';
import { useFirestore } from '@/firebase';

interface MovieCardProps {
  id: number;
  title: string;
  posterUrl: string | null;
  overview?: string;
  poster_path?: string | null;
  trailerUrl?: string;
  className?: string;
}

export function MovieCard({ id, title, posterUrl, trailerUrl, className, overview, poster_path }: MovieCardProps) {
  const { setVideoId } = useVideoPlayer();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handlePlayTrailer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (trailerUrl) {
      const videoId = trailerUrl.includes('v=') ? trailerUrl.split('v=')[1] : trailerUrl;
      setVideoId(videoId);
    }
  };

  const handleSaveMovie = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "Access Restricted",
            description: "Please sign in to curate your collection.",
        });
        return;
    }
    try {
        await saveMovieToPlaylist(firestore, user.uid, { id, title, overview: overview || '', poster_path: poster_path || null });
        toast({
            title: "Added to List",
            description: `${title} is now in your collection.`,
        });
    } catch (error) {
        console.error("Error saving movie:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Unable to sync with your collection. Try again later.",
        });
    }
  };

  return (
    <div className={cn("relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-secondary transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/20 group", className)}>
      {/* Base Content: Poster Image */}
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <Film className="w-12 h-12 text-muted-foreground/30 mb-2" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</span>
        </div>
      )}

      {/* Main Click Area (Stretched Link) */}
      <Link href={`/movie/${id}`} className="absolute inset-0 z-0" aria-label={title} />

      {/* Hover Overlay - Interactive elements with higher z-index */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-10">
        
        {/* Action Buttons (Top Right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 pointer-events-auto">
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-9 w-9 rounded-full glass-card hover:bg-primary hover:text-white border-none shadow-lg transition-colors"
            onClick={handleSaveMovie}
          >
            <Bookmark className="size-4" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-9 w-9 rounded-full glass-card hover:bg-white hover:text-black border-none shadow-lg transition-colors"
            asChild
          >
            <Link href={`/movie/${id}`} onClick={(e) => e.stopPropagation()}>
              <Info className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Center Play Button (Triggered by trailer availability) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          {trailerUrl && (
              <div 
                  className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500 cursor-pointer"
                  onClick={handlePlayTrailer}
              >
                  <Play className="size-8 text-white fill-current ml-1" />
              </div>
          )}
        </div>

        {/* Bottom Info Section */}
        <div className="absolute bottom-0 left-0 p-4 w-full space-y-2 pointer-events-auto">
          <Link href={`/movie/${id}`} onClick={(e) => e.stopPropagation()} className="block">
            <h3 className="font-headline text-base font-black text-white leading-tight line-clamp-2 drop-shadow-lg group-hover:text-primary transition-colors">
                {title}
            </h3>
          </Link>
          <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                  <Star className="size-3 fill-current" />
                  <span>Watch Now</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-white/30" />
              <span className="text-[10px] text-white/70 font-bold uppercase tracking-tighter">Premium Content</span>
          </div>
        </div>
      </div>
    </div>
  );
}
