
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Users } from 'lucide-react';
import { getPosterUrl } from '@/lib/tmdb.client';
import { format } from 'date-fns';
import type { WatchParty } from '@/firebase/firestore/watch-parties';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useMemo } from 'react';

interface WatchPartyCardProps {
  party: WatchParty & { id: string };
}

export function WatchPartyCard({ party }: WatchPartyCardProps) {
  const firestore = useFirestore();
  const rsvpsRef = useMemo(() => 
    firestore ? collection(firestore, `watch-parties/${party.id}/rsvps`) : null
  , [firestore, party.id]);
  const [rsvpsSnapshot] = useCollection(rsvpsRef);
  
  const posterUrl = getPosterUrl(party.moviePosterPath);
  const scheduledDateTime = party.scheduledAt.toDate();

  return (
    <Card className="flex flex-col group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
      <Link href={`/watch-parties/${party.id}`} className="block">
        <CardHeader className="p-0 relative">
          <div className="aspect-video relative w-full">
            {posterUrl && (
              <Image
                src={posterUrl.replace('w500', 'w1280')}
                alt={party.movieTitle}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
          <div className="absolute bottom-0 p-4">
            <CardTitle className="font-headline text-xl text-white shadow-md">{party.movieTitle}</CardTitle>
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{format(scheduledDateTime, 'EEE, MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{format(scheduledDateTime, 'h:mm a')}</span>
        </div>
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{rsvpsSnapshot ? `${rsvpsSnapshot.size} going` : '...'}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 mt-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={party.hostPhotoURL} alt={party.hostDisplayName} />
            <AvatarFallback>{party.hostDisplayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-xs">
            <span className="text-muted-foreground">Hosted by</span>
            <p className="font-semibold">{party.hostDisplayName}</p>
          </div>
        </div>
         <Button asChild>
            <Link href={`/watch-parties/${party.id}`}>View Party</Link>
         </Button>
      </CardFooter>
    </Card>
  );
}

    
