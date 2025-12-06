
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from './ui/card';
import { User } from 'lucide-react';
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
    <Link href={`/person/${person.id}`} passHref>
      <div className={cn("space-y-3 group", className)}>
        <Card className="overflow-hidden border-none aspect-[2/3]">
          <CardContent className="p-0 relative w-full h-full">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={person.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>
        <div className="text-center">
          <p className="font-semibold text-sm truncate group-hover:text-primary">{person.name}</p>
          <p className="text-xs text-muted-foreground">{person.known_for_department}</p>
        </div>
      </div>
    </Link>
  );
}
