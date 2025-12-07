
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { useFirestore } from '@/firebase';
import { useUser } from '@/firebase/auth/auth-client';
import { doc, collection } from 'firebase/firestore';
import { useDocument, useCollection } from 'react-firebase-hooks/firestore';
import { Loader2, Calendar, Clock, Film } from 'lucide-react';
import type { WatchParty } from '@/firebase/firestore/watch-parties';
import Image from 'next/image';
import { getBackdropUrl } from '@/lib/tmdb.client';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { rsvpToWatchParty, cancelRsvpToWatchParty } from '@/firebase/firestore/watch-parties';
import { WatchPartyChat } from '@/components/watch-party-chat';
import { Separator } from '@/components/ui/separator';

export default function WatchPartyDetailPage(props: { params: { id: string } }) {
  const params = props.params;
  const { id: partyId } = params;
  const firestore = useFirestore();
  const { user, isLoading: userLoading } = useUser();
  const { toast } = useToast();
  
  const [isRsvpLoading, setIsRsvpLoading] = useState(false);

  const partyRef = useMemo(() => firestore ? doc(firestore, 'watch-parties', partyId) : null, [firestore, partyId]);
  const [partySnapshot, partyLoading, partyError] = useDocument(partyRef);
  
  const rsvpsRef = useMemo(() => firestore ? collection(firestore, `watch-parties/${partyId}/rsvps`) : null, [firestore, partyId]);
  const [rsvpsSnapshot, rsvpsLoading, rsvpsError] = useCollection(rsvpsRef);

  const party = useMemo(() => partySnapshot?.exists() ? { id: partySnapshot.id, ...partySnapshot.data() } as WatchParty & { id: string } : null, [partySnapshot]);

  const userRsvp = useMemo(() => rsvpsSnapshot?.docs.find(doc => doc.id === user?.uid), [rsvpsSnapshot, user]);

  const handleRsvpToggle = async () => {
    if (!user || !firestore || !party) {
        toast({ variant: 'destructive', title: 'Please log in to RSVP.' });
        return;
    }
    setIsRsvpLoading(true);
    try {
        if (userRsvp) {
            await cancelRsvpToWatchParty(firestore, party.id, user.uid);
            toast({ title: 'RSVP Cancelled' });
        } else {
            await rsvpToWatchParty(firestore, party.id, user);
            toast({ title: 'RSVP Confirmed!', description: "You're on the list!" });
        }
    } catch (error) {
        console.error('RSVP toggle error', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update your RSVP status.' });
    } finally {
        setIsRsvpLoading(false);
    }
  };

  const isLoading = userLoading || partyLoading || rsvpsLoading;

  if (isLoading) {
    return <AppLayout><div className="flex h-screen items-center justify-center"><Loader2 className="h-32 w-32 animate-spin text-primary" /></div></AppLayout>;
  }

  if (partyError || rsvpsError) {
    return <AppLayout><div className="text-center text-destructive">Error: {partyError?.message || rsvpsError?.message}</div></AppLayout>;
  }

  if (!party) {
    return <AppLayout><div className="text-center"><h2>Watch party not found.</h2></div></AppLayout>;
  }
  
  const scheduledDateTime = party.scheduledAt.toDate();
  const backdropUrl = getBackdropUrl(party.moviePosterPath);

  return (
    <AppLayout>
      <div className="relative h-96 md:h-[32rem] w-full">
        {backdropUrl && <Image src={backdropUrl} alt={party.movieTitle} fill className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

      <div className="relative -mt-48 px-4 md:px-8 pb-8">
        <div className="max-w-5xl mx-auto">
            <header className="space-y-4 text-center">
              <p className="text-primary font-semibold tracking-wide">MOVIE WATCH PARTY</p>
              <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-foreground">{party.movieTitle}</h1>
              <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{format(scheduledDateTime, 'EEEE, MMMM d')}</span></div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{format(scheduledDateTime, 'h:mm a')}</span></div>
              </div>
            </header>

            <div className="mt-8 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 space-y-6">
                 <div>
                    <h3 className="font-semibold text-lg mb-2">Hosted by</h3>
                    <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                        <Avatar>
                            <AvatarImage src={party.hostPhotoURL} />
                            <AvatarFallback>{party.hostDisplayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-bold">{party.hostDisplayName}</p>
                    </div>
                </div>

                {user && (
                    <Button onClick={handleRsvpToggle} disabled={isRsvpLoading} size="lg" className="w-full h-12 text-lg">
                        {isRsvpLoading ? <Loader2 className="animate-spin" /> : (userRsvp ? 'Cancel RSVP' : 'RSVP Now')}
                    </Button>
                )}

                <div>
                    <h3 className="font-semibold text-lg mb-2">Attendees ({rsvpsSnapshot?.size || 0})</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {rsvpsSnapshot?.docs.map(doc => (
                            <div key={doc.id} className="flex items-center gap-2 text-sm p-2 rounded-md bg-secondary/50">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={doc.data().photoURL} />
                                    <AvatarFallback>{doc.data().displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{doc.data().displayName}</span>
                            </div>
                        ))}
                    </div>
                </div>

              </div>
              <div className="w-full md:w-2/3">
                <WatchPartyChat partyId={partyId} />
              </div>
            </div>
        </div>
      </div>
    </AppLayout>
  );
}

    