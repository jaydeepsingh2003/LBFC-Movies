
'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/auth-client';
import { useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { Loader2, PlusCircle } from 'lucide-react';
import { WatchPartyCard } from '@/components/watch-party-card';
import type { WatchParty } from '@/firebase/firestore/watch-parties';

export default function WatchPartiesPage() {
  const { user, isLoading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const partiesCollectionRef = firestore ? collection(firestore, 'watch-parties') : null;
  const now = Timestamp.now();

  // Query for upcoming parties, ordered by the scheduled time
  const upcomingQuery = partiesCollectionRef 
    ? query(partiesCollectionRef, where('scheduledAt', '>=', now), where('isPublic', '==', true))
    : null;

  const [upcomingPartiesSnapshot, upcomingLoading, upcomingError] = useCollection(upcomingQuery);

  const renderContent = () => {
    if (userLoading || upcomingLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
    }
    
    if (upcomingError) {
        return <p className="text-destructive text-center">Error: {upcomingError.message}</p>
    }

    if (upcomingPartiesSnapshot?.empty) {
      return (
        <div className="text-center py-16 border-2 border-dashed border-secondary rounded-lg">
          <h3 className="text-lg font-semibold text-foreground">No Upcoming Parties</h3>
          <p className="mt-2 text-sm text-muted-foreground">Why not schedule a new one?</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingPartiesSnapshot?.docs.map(doc => {
          const party = { id: doc.id, ...doc.data() } as WatchParty & { id: string };
          return <WatchPartyCard key={party.id} party={party} />;
        })}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-8">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">Watch Parties</h1>
            <p className="text-muted-foreground">Join a scheduled movie viewing with other fans.</p>
          </div>
           {/* The "Create Party" button will be implemented in a future step. */}
           <Button disabled>
            <PlusCircle className="mr-2" />
            Create Party
          </Button>
        </header>

        <div>{renderContent()}</div>
      </div>
    </AppLayout>
  );
}
