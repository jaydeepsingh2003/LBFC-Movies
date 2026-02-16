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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md md:hidden safe-area-bottom">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-200',
              pathname === item.href
                ? 'text-primary scale-110'
                : 'text-muted-foreground hover:text-foreground',
               item.href === '/my-otts' && pathname !== item.href ? 'my-otts-nav-item' : ''
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className={cn(
              "text-[10px] font-medium truncate max-w-[64px]", 
              item.href === '/my-otts' && 'my-otts-text'
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
