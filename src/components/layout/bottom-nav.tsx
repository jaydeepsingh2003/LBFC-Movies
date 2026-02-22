'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { mobileNavItems } from './sidebar-nav';
import { useUser } from '@/firebase/auth/auth-client';
import { useState, useEffect } from 'react';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = mobileNavItems.map(item => {
    if (item.href === '/profile') {
      if (!mounted || !user) return { ...item, href: '/login' };
      return { ...item, href: `/profile/${user.uid}` };
    }
    return item;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden safe-area-bottom">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl border-t border-white/10 shadow-[0_-15px_50px_rgba(0,0,0,0.9)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative flex h-20 items-center justify-around px-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const isOtt = item.href === '/my-otts';
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1.5 py-2 transition-all duration-500 relative group active:scale-90',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-white'
              )}
            >
              <div className={cn(
                "p-2.5 rounded-2xl transition-all duration-500 relative",
                isActive ? "bg-primary/20 shadow-[0_0_30px_rgba(255,0,0,0.4)]" : "bg-transparent"
              )}>
                <item.icon className={cn(
                    "h-5 w-5 transition-all duration-500", 
                    isActive && "scale-110",
                    !isActive && isOtt && "text-white/90"
                )} />
                
                {isActive && (
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full blur-[1px] animate-pulse" />
                )}
              </div>

              <span className={cn(
                "text-[8px] font-black uppercase transition-all duration-500 truncate max-w-[60px] text-center",
                isActive ? "tracking-[0.15em] text-white opacity-100 scale-105" : "tracking-normal opacity-60",
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
