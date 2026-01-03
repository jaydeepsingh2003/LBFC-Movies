
'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { getWatchProviders, getLogoUrl } from '@/lib/tmdb.client';
import type { WatchProvider } from '@/lib/tmdb';
import { Loader2 } from 'lucide-react';

export default function MyOttsPage() {
  const [platforms, setPlatforms] = useState<WatchProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProviders() {
      setIsLoading(true);
      try {
        const providers = await getWatchProviders();
        // Filter out providers without a logo and sort alphabetically
        const filteredAndSortedProviders = providers
            .filter(p => p.logo_path)
            .sort((a, b) => a.provider_name.localeCompare(b.provider_name));
        setPlatforms(filteredAndSortedProviders);
      } catch (error) {
        console.error("Failed to fetch OTT providers:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProviders();
  }, []);

  if (isLoading) {
    return (
        <AppLayout>
            <div className="flex justify-center items-center h-screen">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <header className="mb-8">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">My OTTs</h1>
          <p className="text-muted-foreground">Browse your favorite streaming channels.</p>
        </header>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
          {platforms.map((platform) => (
            <div key={platform.provider_id} className="flex flex-col items-center gap-2">
              <Card className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all">
                <CardContent className="p-0 aspect-square relative w-full h-full">
                  <Image src={getLogoUrl(platform.logo_path)!} alt={platform.provider_name} fill className="object-cover p-4" />
                </CardContent>
              </Card>
              <p className="text-sm font-medium text-center truncate w-full">{platform.provider_name}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
