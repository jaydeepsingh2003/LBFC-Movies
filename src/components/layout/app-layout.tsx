import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Header } from './header';
import { Film, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const avatar = PlaceHolderImages.find(p => p.id === 'avatar-1');
  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-lg">
                <Film className="size-6" />
            </Button>
            <h1 className="font-headline text-xl font-semibold text-primary">FlickRecs</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
             <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                    {avatar && <AvatarImage src={avatar.imageUrl} alt="User Avatar" />}
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">Alex Doe</span>
                    <span className="text-xs text-muted-foreground">alex.doe@example.com</span>
                </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 animate-in fade-in duration-500">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
