'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from './ui/card';
import { User, Award } from 'lucide-react';
import { getPosterUrl } from '@/lib/tmdb.client';
import type { Person } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface PersonCardProps {
  person: Person;
  className?: string;
}

export function PersonCard({ person, className }: PersonCardProps) {
  const posterUrl = getPosterUrl(person.profile_path);

  return (
    <Link href={`/person/${person.id}`} className={cn("group relative", className)}>
      <div className="space-y-4">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] bg-secondary shadow-2xl transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-primary/20 border-2 border-white/5 group-hover:border-primary/50">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={person.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-background flex items-center justify-center">
              <User className="w-16 h-16 text-muted-foreground/20" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
              <div className="bg-primary p-2 rounded-xl shadow-lg">
                  <Award className="size-4 text-white" />
              </div>
          </div>
        </div>

        <div className="text-center space-y-1 transform transition-transform group-hover:-translate-y-1">
          <p className="font-black text-sm lg:text-lg text-white group-hover:text-primary transition-colors leading-tight line-clamp-1 uppercase tracking-tighter">
            {person.name}
          </p>
          <div className="flex items-center justify-center gap-2">
              <span className="h-px w-4 bg-primary/30" />
              <p className="text-[9px] lg:text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] line-clamp-1">
                {person.known_for_department}
              </p>
              <span className="h-px w-4 bg-primary/30" />
          </div>
        </div>
      </div>
    </Link>
  );
}
