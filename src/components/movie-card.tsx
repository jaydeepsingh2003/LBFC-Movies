import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { Film } from 'lucide-react';

interface MovieCardProps {
  title: string;
  posterId: string;
  className?: string;
}

export function MovieCard({ title, posterId, className }: MovieCardProps) {
  const poster = PlaceHolderImages.find(p => p.id === posterId);

  return (
    <Card className={cn("overflow-hidden border-none shadow-lg group", className)}>
      <CardContent className="p-0 relative aspect-[2/3] w-full">
        {poster ? (
          <Image
            src={poster.imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={poster.imageHint}
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Film className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="font-headline text-lg font-bold text-white shadow-md">{title}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
