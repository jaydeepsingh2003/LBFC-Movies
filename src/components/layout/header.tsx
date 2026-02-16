'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Film, LogOut, Settings, User, Search, Bell } from "lucide-react"
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
        <nav className="flex items-center gap-8 py-3">
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "transition-all duration-300 text-sm font-bold uppercase tracking-widest hover:text-primary relative group",
                        pathname === item.href ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <span className={cn(item.href === '/my-otts' && pathname !== item.href && 'my-otts-text')}>
                        {item.label}
                    </span>
                    <span className={cn(
                        "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                        pathname === item.href && "w-full"
                    )} />
                </Link>
            ))}
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
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <header className={cn(
            "fixed top-0 z-50 w-full transition-all duration-500",
            scrolled ? "bg-background/90 backdrop-blur-xl border-b py-2" : "bg-gradient-to-b from-black/80 to-transparent py-4"
        )}>
            <div className="content-container flex items-center justify-between gap-8">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                    <div className="p-2 bg-primary rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Film className="size-6 text-white" />
                    </div>
                    <h1 className="font-headline text-3xl font-black text-primary tracking-tighter hidden sm:block">LBFC</h1>
                </Link>
                
                {/* Search & Navigation Middle */}
                <div className="flex-1 flex items-center gap-8">
                    <div className="hidden lg:block">
                        <DesktopNav />
                    </div>
                    <div className="flex-1 max-w-xl">
                        <MovieSearch />
                    </div>
                </div>
                
                {/* Actions Section */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hidden md:flex">
                        <Bell className="size-5" />
                    </Button>

                    {(!isClient || isLoading) ? (
                        <div className="h-10 w-10 rounded-full bg-secondary animate-pulse" />
                    ) : user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full focus-visible:ring-primary p-0 ring-2 ring-primary/20 hover:ring-primary transition-all">
                                    <Avatar className="h-full w-full">
                                        {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {user.displayName?.charAt(0) || <User size={20}/>}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 glass-panel mt-2" align="end">
                                <DropdownMenuLabel className="font-normal p-4">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-bold leading-none">{user.displayName || 'Cinema Enthusiast'}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuGroup className="p-2">
                                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                                        <Link href={`/profile/${user.uid}`}>
                                            <User className="mr-3 h-4 w-4 text-primary" />
                                            <span className="font-medium">My Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg cursor-pointer">
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
                    ) : (
                        <Button asChild size="sm" className="font-bold rounded-full px-6 shadow-lg shadow-primary/20">
                            <Link href="/login">Join Now</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
