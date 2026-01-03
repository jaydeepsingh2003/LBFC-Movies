
'use client';

import { Header } from './header';
import { useUser } from '@/firebase/auth/auth-client';
import { BottomNav } from './bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider } from '../ui/sidebar';
import { useState, useEffect } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        {isClient && !isMobile && <Header />}
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        {isClient && isMobile && <BottomNav />}
      </div>
    </SidebarProvider>
  );
}
