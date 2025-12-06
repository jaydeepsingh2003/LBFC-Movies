
"use client";

import Image from 'next/image';
import { Card, CardContent } from './ui/card';
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
    <Link href={`/tv/${id}`} passHref>
      <Card className={cn("overflow-hidden border-none group bg-card", className)}>
        <CardContent className="p-0 relative w-full aspect-[2/3]">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <Tv className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-3 w-full">
            <h3 className="font-headline text-base font-bold text-white shadow-md line-clamp-2">{title}</h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
