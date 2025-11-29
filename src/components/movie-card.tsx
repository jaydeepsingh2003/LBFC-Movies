"use client";

import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { Film, PlayCircle } from 'lucide-react';
import { useVideoPlayer } from '@/context/video-provider';
import Link from 'next/link';

interface MovieCardProps {
  id: number;
  title: string;
  posterUrl: string | null;
  trailerUrl?: string;
  className?: string;
  aspect?: "portrait" | "landscape";
}

export function MovieCard({ id, title, posterUrl, trailerUrl, className, aspect = "portrait" }: MovieCardProps) {
  const aspectRatio = aspect === 'portrait' ? 'aspect-[2/3]' : 'aspect-video';
  const { setVideoId } = useVideoPlayer();

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
          
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={handlePlayTrailer}
          >
            <PlayCircle className="w-12 h-12 text-white/80 drop-shadow-lg cursor-pointer" />
          </div>

          <div className="absolute bottom-0 left-0 p-4">
            <h3 className="font-headline text-lg font-bold text-white shadow-md ">{title}</h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
