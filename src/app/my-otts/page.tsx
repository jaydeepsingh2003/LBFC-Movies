'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getWatchProviders, getLogoUrl } from '@/lib/tmdb.client';
import type { WatchProvider } from '@/lib/tmdb';
import { Loader2, Cast, Globe, Tv, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="flex flex-col justify-center items-center h-svh gap-6 bg-background">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs animate-pulse">Syncing Broadcast Hubs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 py-8 px-4 md:px-8 lg:px-12 max-w-[2000px] mx-auto min-h-screen">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
                <Globe className="size-5" />
                <span className="text-sm font-bold uppercase tracking-[0.3em]">Streaming Network</span>
            </div>
            <h1 className="font-headline text-4xl md:text-7xl font-black tracking-tighter text-white">
              My <span className="text-primary">OTTs</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl font-medium leading-relaxed">
              Instantly access the full catalogs of your preferred streaming giants and regional powerhouses.
            </p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4 bg-secondary/20 border border-white/5 p-4 rounded-3xl backdrop-blur-xl">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Cast className="size-6 text-primary" />
              </div>
              <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white">{platforms.length} Providers</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Linked to your region</p>
              </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 md:gap-8">
        {platforms.map((platform) => (
          <Link key={platform.provider_id} href={`/ott/${platform.provider_id}?name=${encodeURIComponent(platform.provider_name)}`} className="group">
            <div className="space-y-4 flex flex-col items-center">
              <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden border-2 border-white/5 bg-gradient-to-br from-secondary/40 to-background group-hover:border-primary group-hover:scale-105 transition-all duration-500 shadow-2xl group-hover:shadow-primary/20 flex items-center justify-center p-6 lg:p-10 backdrop-blur-sm">
                  <Image 
                    src={getLogoUrl(platform.logo_path)!} 
                    alt={platform.provider_name} 
                    fill 
                    className="object-contain p-6 lg:p-10 transition-transform duration-500 group-hover:scale-110" 
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-center space-y-1 w-full px-2">
                <p className="text-sm lg:text-lg font-black text-white group-hover:text-primary transition-colors truncate uppercase tracking-tight">{platform.provider_name}</p>
                <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">View Catalog</span>
                    <ChevronRight className="size-3 text-primary" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
