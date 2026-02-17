'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Film, LogOut, Settings, User, Bell } from "lucide-react"
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
        <nav className="flex items-center gap-4 lg:gap-6 h-full">
            {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "transition-all duration-300 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em] lg:tracking-[0.15em] hover:text-primary relative group flex items-center gap-2 h-full whitespace-nowrap",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <item.icon className={cn("size-4 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                        <span className={cn(
                            "hidden xl:inline",
                            item.href === '/my-otts' && !isActive && 'my-otts-text'
                        )}>
                            {item.label}
                        </span>
                        <span className={cn(
                            "absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                            isActive && "w-full shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                        )} />
                    </Link>
                );
            })}
        </nav>
    );
}

export function Header() {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <header className={cn(
            "fixed top-0 z-50 w-full transition-all duration-500 h-16 md:h-18",
            scrolled ? "bg-background/95 backdrop-blur-xl border-b shadow-2xl border-white/5" : "bg-black/80 backdrop-blur-sm border-b border-white/5"
        )}>
            <div className="w-full px-4 md:px-8 lg:px-12 max-w-[2200px] mx-auto flex items-center justify-between gap-4 h-full">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                    <div className="p-1 md:p-1.5 bg-primary rounded-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-primary/20">
                        <Film className="size-4 md:size-5 text-white" />
                    </div>
                    <h1 className="font-headline text-lg md:text-2xl font-black text-primary tracking-tighter hidden xs:block">LBFC</h1>
                </Link>
                
                {/* Search & Navigation Middle */}
                <div className="flex-1 flex items-center justify-center gap-4 lg:gap-8 h-full max-w-[1000px]">
                    <div className="hidden lg:block h-full">
                        <DesktopNav />
                    </div>
                    <div className="flex-1 w-full max-w-[320px] lg:max-w-[400px]">
                        <MovieSearch />
                    </div>
                </div>
                
                {/* Actions Section */}
                <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
                    {(!isClient || isLoading) ? (
                        <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-secondary animate-pulse" />
                    ) : user ? (
                        <div className="flex items-center gap-2 md:gap-4">
                            <button className="hidden sm:block text-muted-foreground hover:text-white transition-colors relative">
                                <Bell className="size-5" />
                                <span className="absolute -top-1 -right-1 size-2 bg-primary rounded-full border-2 border-black" />
                            </button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="relative h-8 w-8 md:h-9 md:w-9 rounded-full focus:outline-none ring-2 ring-primary/20 hover:ring-primary transition-all overflow-hidden">
                                        <Avatar className="h-full w-full">
                                            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px] md:text-xs">
                                                {user.displayName?.charAt(0) || <User size={14}/>}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 glass-panel mt-2 border-white/10" align="end">
                                    <DropdownMenuLabel className="font-normal p-4">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-bold leading-none">{user.displayName || 'Cinema Enthusiast'}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuGroup className="p-2">
                                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-primary/10">
                                            <Link href={`/profile/${user.uid}`}>
                                                <User className="mr-3 h-4 w-4 text-primary" />
                                                <span className="font-medium">My Profile</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-lg cursor-pointer focus:bg-primary/10">
                                            <Settings className="mr-3 h-4 w-4 text-primary" />
                                            <span className="font-medium">Settings</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <div className="p-2">
                                        <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                                            <LogOut className="mr-3 h-4 w-4" />
                                            <span className="font-bold">Log out</span>
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <Button asChild size="sm" className="font-black rounded-full px-6 h-9 shadow-lg shadow-primary/30 text-[10px] md:text-xs uppercase tracking-widest bg-primary hover:bg-primary/90">
                            <Link href="/login">Join Vault</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
