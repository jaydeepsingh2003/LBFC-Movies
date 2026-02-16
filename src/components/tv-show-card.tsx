"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tv } from 'lucide-react';
import Link from 'next/link';

interface TVShowCardProps {
  id: number;
  title: string;
  posterUrl: string | null;
  className?: string;
}

export function TVShowCard({ id, title, posterUrl, className }: TVShowCardProps) {
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

      {/* Main Click Area */}
      <Link href={`/tv/${id}`} className="absolute inset-0 z-0" aria-label={title} />

      {/* Visual Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none z-10">
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h3 className="font-headline text-base font-bold text-white shadow-md line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}
