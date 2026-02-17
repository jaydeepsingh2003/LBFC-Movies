'use client';

import { Header } from './header';
import { useUser } from '@/firebase/auth/auth-client';
import { BottomNav } from './bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // GLOBAL SECURITY GUARD: Redirect to login if not authenticated
  useEffect(() => {
    if (isClient && !isLoading && !user) {
      router.push('/login');
    }
  }, [isClient, isLoading, user, router]);

  // Premium Loading State during Auth Verification
  if (!isClient || isLoading || (!user && isClient)) {
    return (
      <div className="flex flex-col justify-center items-center h-svh bg-background gap-6">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground font-black tracking-widest uppercase text-[10px] animate-pulse">Establishing Secure Link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
      {/* Header is always visible at the top */}
      <Header />
      <main className="flex-1 w-full max-w-[2000px] mx-auto pt-16 md:pt-18 pb-24 md:pb-12">
        {children}
      </main>
      {isMobile && <BottomNav />}
    </div>
  );
}
