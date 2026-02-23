
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getWatchProviders, getLogoUrl } from '@/lib/tmdb.client';
import type { WatchProvider } from '@/lib/tmdb';
import { Loader2, Cast, Globe, Tv, ChevronRight, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
      <div className="flex flex-col justify-center items-center h-svh gap-8 bg-transparent">
        <div className="relative">
            <Loader2 className="h-20 w-20 animate-spin text-primary" />
            <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground font-black tracking-[0.5em] uppercase text-xs animate-pulse">Syncing Broadcast Hubs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-20 py-12 px-4 md:px-8 lg:px-12 max-w-[2000px] mx-auto min-h-screen">
      <header className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
                <Globe className="size-6" />
                <span className="text-sm font-black uppercase tracking-[0.4em]">Streaming Network</span>
            </div>
            <h1 className="font-headline text-4xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
              My <span className="text-primary">OTT Hubs</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl font-medium leading-relaxed opacity-80">
              Instant handoff to the global streaming giants and regional narrative powerhouses.
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-secondary/20 border border-white/5 p-6 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl">
                  <Cast className="size-8 text-primary" />
              </div>
              <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black uppercase tracking-tighter text-white leading-none">{platforms.length} Nodes</p>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[8px] font-black uppercase py-0.5">Live Connection</Badge>
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="size-3" /> Encrypted Protocol Active
                  </p>
              </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-8 md:gap-10">
        {platforms.map((platform) => (
          <Link key={platform.provider_id} href={`/ott/${platform.provider_id}?name=${encodeURIComponent(platform.provider_name)}`} className="group">
            <div className="space-y-6 flex flex-col items-center">
              <div className="relative aspect-square w-full rounded-[3rem] overflow-hidden border-2 border-white/5 bg-gradient-to-br from-secondary/40 to-background group-hover:border-primary group-hover:scale-105 transition-all duration-700 shadow-2xl group-hover:shadow-[0_30px_60px_rgba(225,29,72,0.2)] flex items-center justify-center p-10 lg:p-14 backdrop-blur-xl">
                  <Image 
                    src={getLogoUrl(platform.logo_path)!} 
                    alt={platform.provider_name} 
                    fill 
                    className="object-contain p-10 lg:p-14 transition-all duration-700 group-hover:scale-110 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" 
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <Zap className="size-4 text-primary fill-current" />
                  </div>
              </div>
              <div className="text-center space-y-2 w-full px-4 transform transition-transform duration-500 group-hover:-translate-y-1">
                <p className="text-sm lg:text-lg font-black text-white group-hover:text-primary transition-colors truncate uppercase tracking-tighter">{platform.provider_name}</p>
                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <span className="h-px w-4 bg-primary/30" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-white transition-colors">Access Hub</span>
                    <ChevronRight className="size-3 text-primary animate-pulse" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <footer className="pt-20 border-t border-white/5 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 p-4 glass-panel rounded-2xl border-white/5">
              <ShieldCheck className="size-5 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">End-to-End Encrypted Signal Transmission</p>
          </div>
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground/30 text-center max-w-md leading-loose">
            CINEVEXIA utilizes real-time API handshakes to ensure catalog parity with global streaming infrastructure.
          </p>
      </footer>
    </div>
  );
}
