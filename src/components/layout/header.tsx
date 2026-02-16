'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Film, LogOut, Settings, User, Search } from "lucide-react"
import { MovieSearch } from "../movie-search"
import { useUser, logout } from "@/firebase/auth/auth-client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { allNavItems } from "./sidebar-nav";

export function DesktopNav() {
    const pathname = usePathname();
    const { user } = useUser();

    const items = allNavItems.map(item => {
        if (item.href === '/profile') {
            return { ...item, href: user ? `/profile/${user.uid}` : '/login' };
        }
        return item;
    });

    return (
        <nav className="flex items-center justify-center gap-6 py-2 overflow-x-auto no-scrollbar">
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "transition-all duration-200 text-sm font-medium whitespace-nowrap px-1 py-1 border-b-2 border-transparent hover:text-primary",
                        pathname === item.href ? "text-primary border-primary" : "text-muted-foreground",
                        item.href === '/my-otts' && pathname !== item.href && 'my-otts-text'
                    )}
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}

export function Header() {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Top Tier: Logo, Search, User */}
            <div className="flex h-16 items-center justify-between px-4 md:px-8 gap-4">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <Film className="size-8 text-primary" />
                        <h1 className="font-headline text-2xl font-bold text-primary tracking-wider hidden sm:block">LBFC</h1>
                    </Link>
                </div>
                
                <div className="flex-1 max-w-2xl px-2 md:px-8">
                    <MovieSearch />
                </div>
                
                <div className="flex items-center gap-4 flex-shrink-0">
                    {(!isClient || isLoading) ? (
                        <div className="h-10 w-10 rounded-full bg-secondary animate-pulse" />
                    ) : user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full focus-visible:ring-primary">
                                    <Avatar className="h-10 w-10 border-2 border-primary/50 hover:border-primary transition-colors">
                                        {user.photoURL && <AvatarImage src={user.photoURL} alt="User Avatar" />}
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/profile/${user.uid}`}>
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild size="sm" className="font-semibold">
                            <Link href="/login">Login</Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Bottom Tier: Desktop Navigation Links */}
            <div className="hidden md:block border-t bg-muted/30">
                <div className="px-8">
                    <DesktopNav />
                </div>
            </div>
        </header>
    )
}
