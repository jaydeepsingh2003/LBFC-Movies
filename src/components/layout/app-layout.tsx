
'use client';

import { Header } from './header';
import { useUser } from '@/firebase/auth/auth-client';
import { BottomNav } from './bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider } from '../ui/sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        {!isMobile && <Header />}
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        {isMobile && <BottomNav />}
      </div>
    </SidebarProvider>
  );
}
