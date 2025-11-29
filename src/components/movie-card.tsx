import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { Film } from 'lucide-react';

interface MovieCardProps {
  title: string;
  posterUrl: string | null;
  className?: string;
  aspect?: "portrait" | "landscape";
}

export function MovieCard({ title, posterUrl, className, aspect = "portrait" }: MovieCardProps) {
  const aspectRatio = aspect === 'portrait' ? 'aspect-[2/3]' : 'aspect-video';

  return (
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="font-headline text-lg font-bold text-white shadow-md">{title}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
