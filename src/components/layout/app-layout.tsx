
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
    <div>
      <div className={`flex flex-col w-full pb-16 md:pb-0`}>
        <Header />
        <main className="flex-1 animate-in fade-in duration-500">
          {children}
        </main>
      </div>
      {isMobile && <BottomNav />}
    </div>
  );
}
