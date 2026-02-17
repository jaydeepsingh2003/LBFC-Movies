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
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden safe-area-bottom">
      {/* Premium Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]" />
      
      <div className="relative flex h-18 items-center justify-around px-4">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const isOtt = item.href === '/my-otts';
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1.5 py-2 transition-all duration-500 relative group active:scale-95',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-white'
              )}
            >
              {/* Active Glow Indicator */}
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-500 relative",
                isActive ? "bg-primary/15 shadow-[0_0_20px_rgba(255,0,0,0.2)]" : "bg-transparent"
              )}>
                <item.icon className={cn(
                    "h-5 w-5 transition-transform duration-500", 
                    isActive && "scale-110",
                    !isActive && isOtt && "text-white/80"
                )} />
                
                {/* Subtle Dot Indicator */}
                {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full blur-[1.5px] animate-pulse" />
                )}
              </div>

              <span className={cn(
                "text-[8px] font-black uppercase transition-all duration-500 truncate max-w-[60px]",
                isActive ? "tracking-[0.15em] text-white" : "tracking-tighter",
                isOtt && !isActive && 'my-otts-text'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
