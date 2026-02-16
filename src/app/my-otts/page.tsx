'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
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
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">My OTTs</h1>
        <p className="text-muted-foreground">Browse your favorite streaming channels.</p>
      </header>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
        {platforms.map((platform) => (
          <Link key={platform.provider_id} href={`/ott/${platform.provider_id}?name=${encodeURIComponent(platform.provider_name)}`} passHref>
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-secondary group-hover:border-primary transition-all relative bg-secondary/50 flex items-center justify-center">
                  <Image src={getLogoUrl(platform.logo_path)!} alt={platform.provider_name} fill className="object-contain p-4" />
              </div>
              <p className="text-sm font-medium text-center truncate w-full group-hover:text-primary">{platform.provider_name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
