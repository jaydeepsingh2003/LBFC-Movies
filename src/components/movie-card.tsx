"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Play, Bookmark, Star, Info, Share2, Clapperboard } from 'lucide-react';
import { useVideoPlayer } from '@/context/video-provider';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { useUser } from '@/firebase/auth/auth-client';
import { useToast } from '@/hooks/use-toast';
import { saveMovieToPlaylist, removeMovieFromPlaylist } from '@/firebase/firestore/playlists';
import { useFirestore } from '@/firebase';
import { useIsMobile } from '@/hooks/use-mobile';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { gsap } from 'gsap';

interface MovieCardProps {
  id: number;
  title: string;
  posterUrl: string | null;
  overview?: string;
  poster_path?: string | null;
  trailerUrl?: string;
  className?: string;
}

export function MovieCard({ id, title, posterUrl, className, overview, poster_path }: MovieCardProps) {
  const { setActiveMedia } = useVideoPlayer();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLDivElement>(null);

  const savedRef = useMemo(() => 
    user && firestore ? doc(firestore, `users/${user.uid}/savedMovies/${id}`) : null
  , [firestore, user, id]);
  
  const [savedDoc, isSavedLoading] = useDocumentData(savedRef);
  const isSaved = !!savedDoc;

  useEffect(() => {
    if (isMobile || !cardRef.current) return;

    const card = cardRef.current;
    
    const onMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -15; // Increased intensity
      const rotateY = ((x - centerX) / centerX) * 15;

      gsap.to(card, {
        rotationX: rotateX,
        rotationY: rotateY,
        scale: 1.06,
        duration: 0.3, // Faster response
        ease: 'power3.out',
        transformPerspective: 1200,
        force3D: true,
        overwrite: 'auto'
      });
    };

    const onMouseLeave = () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power3.out',
        force3D: true
      });
    };

    card.addEventListener('mousemove', onMouseMove, { passive: true });
    card.addEventListener('mouseleave', onMouseLeave, { passive: true });
    return () => {
      card.removeEventListener('mousemove', onMouseMove);
      card.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isMobile]);

  const handleNavigateToDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/movie/${id}`);
  };

  const handlePlayNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMedia({ type: 'movie', id, title, posterPath: poster_path });
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
            await removeMovieFromPlaylist(firestore, user.uid, id);
            toast({ title: "Removed from Vault" });
        } else {
            await saveMovieToPlaylist(firestore, user.uid, { id, title, overview: overview || '', poster_path: poster_path || null });
            toast({ title: "Added to Vault" });
        }
    } catch (error) { console.error(error); }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/movie/${id}`;
    if (navigator.share) {
        navigator.share({ title, url }).catch(console.error);
    } else {
        navigator.clipboard.writeText(url);
        toast({ title: "Link Copied" });
    }
  };

  return (
    <div 
      ref={cardRef}
      onClick={handleNavigateToDetails}
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-secondary transition-shadow duration-500 hover:shadow-[0_25px_60px_rgba(225,29,72,0.4)] group cursor-pointer border border-white/10 preserve-3d will-change-transform", 
        className
      )}
    >
      {posterUrl ? (
        <Image src={posterUrl} alt={title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" quality={90} unoptimized />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <Clapperboard className="w-12 h-12 text-muted-foreground/30 mb-2" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</span>
        </div>
      )}

      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent transition-opacity duration-500 z-10",
        isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          <Button variant="secondary" size="icon" className={cn("h-8 w-8 rounded-full glass-card border-none shadow-lg transition-all", isSaved ? "bg-primary text-white" : "bg-black/40 hover:bg-primary")} onClick={handleToggleSave} disabled={isSavedLoading}>
            <Bookmark className={cn("size-3.5", isSaved && "fill-current")} />
          </Button>
          <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full glass-card bg-black/40 hover:bg-blue-500 border-none shadow-lg" onClick={handleShare}>
            <Share2 className="size-3.5" />
          </Button>
          <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full glass-card bg-black/40 hover:bg-yellow-500 border-none shadow-lg" onClick={handleNavigateToDetails}>
            <Info className="size-3.5" />
          </Button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="h-14 w-14 md:h-18 md:w-18 rounded-full bg-primary/95 flex items-center justify-center shadow-2xl scale-90 md:scale-75 group-hover:scale-100 transition-all duration-500 cursor-pointer" onClick={handlePlayNow}>
              <Play className="size-7 md:size-9 text-white fill-current ml-1" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 p-4 w-full space-y-1 z-10 pointer-events-none">
          <h3 className="font-headline text-sm md:text-base font-black text-white leading-tight line-clamp-2 uppercase tracking-tight group-hover:text-primary transition-colors">{title}</h3>
          <div className="flex items-center gap-2">
              <Star className="size-3 text-yellow-400 fill-current" />
              <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Cinema Grade</span>
          </div>
        </div>
      </div>
    </div>
  );
}