
'use client';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Header } from './header';
import { Film, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useUser } from '@/firebase/auth/auth-client';
import Link from 'next/link';
import { BottomNav } from './bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const isMobile = useIsMobile();

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-lg" asChild>
                <Link href="/"><Film className="size-6" /></Link>
            </Button>
            <h1 className="font-headline text-2xl font-bold text-primary tracking-wider">LBFC</h1>
          </div>
          <SidebarTrigger className="ml-auto" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        {user && (
          <SidebarFooter>
              <Link href={`/profile/${user.uid}`} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                      {user.photoURL && <AvatarImage src={user.photoURL} alt="User Avatar" />}
                      <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium text-foreground truncate">{user.displayName}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
              </Link>
          </SidebarFooter>
        )}
      </Sidebar>
      <div className={`flex flex-col w-full md:pl-[--sidebar-width] pb-16 md:pb-0`}>
        <Header />
        <main className="flex-1 animate-in fade-in duration-500">
          {children}
        </main>
      </div>
      {isMobile && <BottomNav />}
    </>
  );
}
