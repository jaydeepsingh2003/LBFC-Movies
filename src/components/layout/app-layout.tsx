'use client';

import { Header } from './header';
import { useUser } from '@/firebase/auth/auth-client';
import { BottomNav } from './bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
      {/* Header is now always visible at the top, including mobile */}
      {isClient && <Header />}
      <main className="flex-1 w-full max-w-[2000px] mx-auto pt-16 md:pt-18 pb-24 md:pb-12">
        {children}
      </main>
      {isClient && isMobile && <BottomNav />}
    </div>
  );
}
