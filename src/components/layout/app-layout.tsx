
'use client';

import { Header } from './header';
import { useUser } from '@/firebase/auth/auth-client';
import { BottomNav } from './bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { CinemaCursor } from './cinema-cursor';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isLoading) {
      const isUnauthenticated = !user;
      const isUnverified = user && !user.emailVerified;
      
      if ((isUnauthenticated || isUnverified) && pathname !== '/login') {
        router.push('/login');
      }
    }
  }, [isClient, isLoading, user, router, pathname]);

  if (!isClient || isLoading || ((!user || !user.emailVerified) && pathname !== '/login')) {
    return (
      <div className="flex flex-col justify-center items-center h-svh bg-transparent gap-6">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground font-black tracking-widest uppercase text-[10px] animate-pulse">Establishing Secure Link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent selection:bg-primary/30 relative overflow-x-hidden">
      <CinemaCursor />
      <Header />
      <main className="flex-1 w-full max-w-[2000px] mx-auto pt-16 md:pt-18 pb-24 md:pb-12">
        {children}
      </main>
      {isMobile && <BottomNav />}
    </div>
  );
}
