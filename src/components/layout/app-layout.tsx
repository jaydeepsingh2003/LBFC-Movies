'use client';

import { Header } from './header';
import { useUser } from '@/firebase/auth/auth-client';
import { BottomNav } from './bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const isMobile = useIsMobile();

  return (
    <div>
      <Header />
      <main>
        {children}
      </main>
      {isMobile && <BottomNav />}
    </div>
  );
}
