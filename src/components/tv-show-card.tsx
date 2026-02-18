
"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tv, Play, Info, Star, Bookmark, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useVideoPlayer } from '@/context/video-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { useUser } from '@/firebase/auth/auth-client';
import { useFirestore } from '@/firebase';
import { saveTvShowToPlaylist, removeTvShowFromPlaylist } from '@/firebase/firestore/tv-playlists';
import { useIsMobile } from '@/hooks/use-mobile';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';

interface TVShowCardProps {
  id: number;
  title: string;
  posterUrl: string | null;
  overview?: string;
  poster_path?: string | null;
  className?: string;
}

export function TVShowCard({ id, title, posterUrl, className, overview, poster_path }: TVShowCardProps) {
  const { setActiveMedia } = useVideoPlayer();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();

  const savedRef = useMemo(() => 
    user && firestore ? doc(firestore, `users/${user.uid}/savedTvShows/${id}`) : null
  , [firestore, user, id]);
  
  const [savedDoc, isSavedLoading] = useDocumentData(savedRef);
  const isSaved = !!savedDoc;

  const handleNavigateToDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/tv/${id}`);
  };

  const handlePlayNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMedia({ type: 'tv', id, season: 1, episode: 1 });
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Auth Required" });
        return;
    }

    try {
        if (isSaved) {
            await removeTvShowFromPlaylist(firestore, user.uid, id);
            toast({ title: "Removed from TV Vault" });
        } else {
            await saveTvShowToPlaylist(firestore, user.uid, { 
                id, 
                name: title, 
                overview: overview || '', 
                poster_path: poster_path || null 
            });
            toast({ title: "Added to TV Vault" });
        }
    } catch (error) {
        console.error(error);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/tv/${id}`;
    if (navigator.share) {
        navigator.share({ title, url }).catch(console.error);
    } else {
        navigator.clipboard.writeText(url);
        toast({ title: "Link Copied" });
    }
  };

  return (
    <div 
      onClick={handleNavigateToDetails}
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-secondary transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/20 group cursor-pointer border border-white/5", 
        className
      )}
    >
      {posterUrl ? (
        <Image 
            src={posterUrl} 
            alt={title} 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 50vw, 25vw"
            quality={90}
            unoptimized
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <Tv className="w-12 h-12 text-muted-foreground/30 mb-2" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</span>
        </div>
      )}

      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent transition-all duration-500 z-10",
        isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          <Button 
            variant="secondary" 
            size="icon" 
            className={cn(
                "h-8 w-8 rounded-full glass-card border-none shadow-lg backdrop-blur-md transition-all",
                isSaved ? "bg-primary text-white" : "bg-black/40 hover:bg-primary"
            )} 
            onClick={handleToggleSave}
            disabled={isSavedLoading}
          >
            <Bookmark className={cn("size-3.5", isSaved && "fill-current")} />
          </Button>
          <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full glass-card bg-black/40 hover:bg-blue-500 border-none shadow-lg backdrop-blur-md" onClick={handleShare}>
            <Share2 className="size-3.5" />
          </Button>
          <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full glass-card bg-black/40 hover:bg-yellow-500 border-none shadow-lg backdrop-blur-md" onClick={handleNavigateToDetails}>
            <Info className="size-3.5" />
          </Button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div 
            className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl scale-90 md:scale-75 group-hover:scale-100 transition-transform duration-500 cursor-pointer" 
            onClick={handlePlayNow}
          >
              <Play className="size-6 md:size-8 text-white fill-current ml-1" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 p-3 md:p-4 w-full z-10 space-y-1 pointer-events-none">
          <h3 className="font-headline text-xs md:text-sm font-black text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
              <Star className="size-2.5 md:size-3 text-yellow-400 fill-current" />
              <span className="text-[8px] md:text-[10px] font-bold text-white/70 uppercase tracking-widest">Series</span>
          </div>
        </div>
      </div>
    </div>
  );
}
