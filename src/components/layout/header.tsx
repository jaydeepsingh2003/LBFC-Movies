'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Film, LogOut, Settings, User, Bell, Shield, Zap, Sparkles, Activity, CheckCircle2 } from "lucide-react"
import { MovieSearch } from "../movie-search"
import { useUser, logout } from "@/firebase/auth/auth-client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { allNavItems } from "./sidebar-nav";
import { Badge } from "@/components/ui/badge";

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

    const notifications = [
        { id: 1, title: 'Vault Entry Confirmed', desc: 'Secure login detected from a new browser.', time: '2m ago', icon: Shield, color: 'text-blue-400' },
        { id: 2, title: 'New Trending Drop', desc: 'Top 10 Global Hits have been updated.', time: '1h ago', icon: Zap, color: 'text-yellow-400' },
        { id: 3, title: 'Welcome to LBFC', desc: 'Start your cinematic journey in the vault.', time: '2h ago', icon: Sparkles, color: 'text-primary' },
    ];

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
                            {/* Premium Notification Hub */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="text-muted-foreground hover:text-white transition-all relative p-2 rounded-full hover:bg-white/5 group">
                                        <Bell className="size-5 group-hover:scale-110 transition-transform" />
                                        <span className="absolute top-1.5 right-1.5 size-2.5 bg-primary rounded-full border-2 border-black animate-pulse" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-80 glass-panel mt-2 border-white/10 p-0 overflow-hidden" align="end">
                                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Activity className="size-4 text-primary" />
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Vault Activity</h3>
                                        </div>
                                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-white/10">3 New</Badge>
                                    </div>
                                    <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                                        {notifications.map((notif) => (
                                            <DropdownMenuItem key={notif.id} className="p-4 focus:bg-white/5 border-b border-white/5 last:border-0 cursor-pointer flex items-start gap-4 transition-colors">
                                                <div className={cn("mt-1 p-2 rounded-xl bg-white/5 shrink-0", notif.color)}>
                                                    <notif.icon className="size-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-[11px] font-bold text-white leading-none">{notif.title}</p>
                                                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">{notif.time}</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{notif.desc}</p>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-white/5 text-center">
                                        <button className="text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:underline">Clear Archive</button>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* User Command Center */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="relative h-8 w-8 md:h-9 md:w-9 rounded-full focus:outline-none ring-2 ring-primary/20 hover:ring-primary transition-all overflow-hidden group">
                                        <Avatar className="h-full w-full group-hover:scale-110 transition-transform">
                                            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px] md:text-xs">
                                                {user.displayName?.charAt(0) || <User size={14}/>}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 glass-panel mt-2 border-white/10 p-2" align="end">
                                    <DropdownMenuLabel className="font-normal p-3">
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold leading-none text-white">{user.displayName || 'Cinema Enthusiast'}</p>
                                                <CheckCircle2 className="size-3 text-blue-400" />
                                            </div>
                                            <p className="text-[10px] leading-none text-muted-foreground truncate">{user.email}</p>
                                            <Badge className="w-fit bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase tracking-[0.2em] py-1">Cinema Architect</Badge>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10 mx-2" />
                                    <DropdownMenuGroup className="space-y-1">
                                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-primary/10 py-3">
                                            <Link href={`/profile/${user.uid}`}>
                                                <User className="mr-3 h-4 w-4 text-primary" />
                                                <span className="text-[11px] font-black uppercase tracking-widest">My Archive</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-lg cursor-pointer focus:bg-primary/10 py-3">
                                            <Settings className="mr-3 h-4 w-4 text-primary" />
                                            <span className="text-[11px] font-black uppercase tracking-widest">Command Center</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="bg-white/10 mx-2" />
                                    <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-3">
                                        <LogOut className="mr-3 h-4 w-4" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">Sever Secure Link</span>
                                    </DropdownMenuItem>
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
