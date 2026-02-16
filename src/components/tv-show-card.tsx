
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tv, Play, Info, Loader2, Star, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { useVideoPlayer } from '@/context/video-provider';
import { getTvShowVideos } from '@/lib/tmdb.client';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { useUser } from '@/firebase/auth/auth-client';
import { useFirestore } from '@/firebase';
import { saveTvShowToPlaylist } from '@/firebase/firestore/tv-playlists';

interface TVShowCardProps {
  id: number;
  title: string;
  posterUrl: string | null;
  overview?: string;
  poster_path?: string | null;
  className?: string;
}

export function TVShowCard({ id, title, posterUrl, className, overview, poster_path }: TVShowCardProps) {
  const { setVideoId } = useVideoPlayer();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [cachedTrailer, setCachedTrailer] = useState<string | null>(null);

  const handlePlayTrailer = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (cachedTrailer) {
      setVideoId(cachedTrailer);
      return;
    }

    setIsLoadingTrailer(true);
    try {
      const videos = await getTvShowVideos(id);
      const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer) {
        setCachedTrailer(trailer.key);
        setVideoId(trailer.key);
      } else {
        toast({
          title: "Trailer Unavailable",
          description: "We couldn't find a preview for this show.",
        });
      }
    } catch (error) {
      console.error("Error fetching TV trailer:", error);
    } finally {
      setIsLoadingTrailer(false);
    }
  };

  const handleSaveShow = async (e: React.MouseEvent) => {
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
        await saveTvShowToPlaylist(firestore, user.uid, { id, name: title, overview: overview || '', poster_path: poster_path || null });
        toast({
            title: "Added to List",
            description: `${title} is now in your collection.`,
        });
    } catch (error) {
        console.error("Error saving TV show:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Unable to sync with your collection. Try again later.",
        });
    }
  };

  return (
    <div className={cn("relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-secondary transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/20 group", className)}>
      {/* Base Content */}
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
          <Tv className="w-12 h-12 text-muted-foreground/30 mb-2" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</span>
        </div>
      )}

      {/* Main Click Area (Stretched Link) */}
      <Link href={`/tv/${id}`} className="absolute inset-0 z-0" aria-label={title} />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-10">
        
        {/* Action Buttons (Top Right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 pointer-events-auto">
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-9 w-9 rounded-full glass-card hover:bg-primary hover:text-white border-none shadow-lg transition-colors"
            onClick={handleSaveShow}
          >
            <Bookmark className="size-4" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-9 w-9 rounded-full glass-card hover:bg-white hover:text-black border-none shadow-lg transition-colors"
            asChild
          >
            <Link href={`/tv/${id}`} onClick={(e) => e.stopPropagation()}>
              <Info className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div 
              className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500 cursor-pointer"
              onClick={handlePlayTrailer}
          >
              {isLoadingTrailer ? (
                <Loader2 className="size-8 text-white animate-spin" />
              ) : (
                <Play className="size-8 text-white fill-current ml-1" />
              )}
          </div>
        </div>

        {/* Bottom Info Section */}
        <div className="absolute bottom-0 left-0 p-4 w-full pointer-events-auto">
          <Link href={`/tv/${id}`} onClick={(e) => e.stopPropagation()} className="block">
            <h3 className="font-headline text-sm font-bold text-white shadow-md line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1">
              <Star className="size-3 text-yellow-400 fill-current" />
              <span className="text-[10px] font-bold text-white/70 uppercase">TV Series</span>
          </div>
        </div>
      </div>
    </div>
  );
}
