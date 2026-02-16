'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { mobileNavItems } from './sidebar-nav';
import { useUser } from '@/firebase/auth/auth-client';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const items = mobileNavItems.map(item => {
    if (item.href === '/profile') {
      return { ...item, href: user ? `/profile/${user.uid}` : '/login' };
    }
    return item;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel bg-background/80 md:hidden safe-area-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.5)] border-t border-white/5">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-300 relative',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-white'
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive && "bg-primary/10"
              )}>
                <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-tighter truncate max-w-[64px] transition-all",
                isActive && "tracking-widest",
                item.href === '/my-otts' && !isActive && 'my-otts-text'
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full blur-[1px]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
