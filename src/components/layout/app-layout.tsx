
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 w-full">
        <main className="flex-1">
          {children}
        </main>
      </div>
      {isMobile && <BottomNav />}
    </div>
  );
}
