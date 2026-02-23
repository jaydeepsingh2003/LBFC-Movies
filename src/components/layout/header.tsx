'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, LogOut, Settings, User, Bell, Shield, Zap, Sparkles, Activity, CheckCircle2, Loader2, Save } from "lucide-react"
import { MovieSearch } from "../movie-search"
import { useUser, logout, updateUserProfile } from "@/firebase/auth/auth-client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { allNavItems } from "./sidebar-nav";
import { useToast } from "@/hooks/use-toast";
import { CinevexiaLogo } from "@/components/icons/cinevexia-logo";

export function DesktopNav() {
    const pathname = usePathname();
    const { user } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const items = allNavItems.map(item => {
        if (item.href === '/profile') {
            if (!mounted || !user) return { ...item, href: '/login' };
            return { ...item, href: `/profile/${user.uid}` };
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
                            "transition-all duration-300 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.15em] hover:text-primary relative group flex items-center gap-2 h-full whitespace-nowrap",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <item.icon className={cn("size-4 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                        <span className="hidden xl:inline">{item.label}</span>
                        <span className={cn(
                            "absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                            isActive && "w-full shadow-[0_0_10px_rgba(229,9,20,0.5)]"
                        )} />
                    </Link>
                );
            })}
        </nav>
    );
}

export function Header() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState("");
    const [newPhotoURL, setNewPhotoURL] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (user) {
            setNewDisplayName(user.displayName || "");
            setNewPhotoURL(user.photoURL || "");
        }
    }, [user]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsUpdating(true);
        try {
            await updateUserProfile(user, { displayName: newDisplayName, photoURL: newPhotoURL });
            toast({ title: "Profile Updated", description: "Identity sync complete." });
            setIsSettingsOpen(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <header className={cn(
            "fixed top-0 z-50 w-full transition-all duration-500 h-16 md:h-18",
            scrolled ? "bg-background/95 backdrop-blur-xl border-b shadow-2xl border-white/5" : "bg-black/80 backdrop-blur-sm border-b border-white/5"
        )}>
            <div className="w-full px-4 md:px-8 lg:px-12 max-w-[2200px] mx-auto flex items-center justify-between gap-4 h-full">
                <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
                    <div className="size-8 group-hover:scale-110 transition-transform">
                        <CinevexiaLogo />
                    </div>
                    <div className="flex items-center">
                        <span className="font-headline text-xl md:text-2xl font-black uppercase tracking-[0.1em] text-white">
                            CINE<span className="text-primary">V</span>EXIA
                        </span>
                    </div>
                </Link>
                
                <div className="flex-1 flex items-center justify-center gap-4 lg:gap-8 h-full max-w-[1000px]">
                    <div className="hidden lg:block h-full">
                        <DesktopNav />
                    </div>
                    <div className="flex-1 w-full max-w-[320px] lg:max-w-[400px]">
                        <MovieSearch />
                    </div>
                </div>
                
                <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
                    {!isClient ? (
                        <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-secondary animate-pulse" />
                    ) : user ? (
                        <div className="flex items-center gap-2 md:gap-4">
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
                                                <p className="text-sm font-bold leading-none text-white">{user.displayName || 'Streamer'}</p>
                                                <CheckCircle2 className="size-3 text-blue-400" />
                                            </div>
                                            <p className="text-[10px] leading-none text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10 mx-2" />
                                    <DropdownMenuGroup className="space-y-1">
                                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-primary/10 py-3">
                                            <Link href={`/profile/${user.uid}`}>
                                                <User className="mr-3 h-4 w-4 text-primary" />
                                                <span className="text-[11px] font-black uppercase tracking-widest">My Profile</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="rounded-lg cursor-pointer focus:bg-primary/10 py-3"
                                            onClick={() => setIsSettingsOpen(true)}
                                        >
                                            <Settings className="mr-3 h-4 w-4 text-primary" />
                                            <span className="text-[11px] font-black uppercase tracking-widest">Settings</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="bg-white/10 mx-2" />
                                    <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-3">
                                        <LogOut className="mr-3 h-4 w-4" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <Button asChild size="sm" className="font-black rounded-full px-6 h-9 shadow-lg text-[10px] md:text-xs uppercase tracking-widest bg-primary hover:bg-primary/90">
                            <Link href="/login">Sign In</Link>
                        </Button>
                    )}
                </div>
            </div>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="glass-panel border-white/10 text-white rounded-[2rem] sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-headline font-black uppercase tracking-tighter">Settings</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Update your profile info.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProfile} className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Display Name</Label>
                                <Input 
                                    id="name" 
                                    value={newDisplayName} 
                                    onChange={(e) => setNewDisplayName(e.target.value)}
                                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary transition-all"
                                    disabled={isUpdating}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="photo" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profile Photo URL</Label>
                                <Input 
                                    id="photo" 
                                    value={newPhotoURL} 
                                    onChange={(e) => setNewPhotoURL(e.target.value)}
                                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary transition-all"
                                    disabled={isUpdating}
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button 
                                type="submit" 
                                className="w-full h-14 bg-primary hover:bg-primary/90 rounded-xl font-black uppercase tracking-widest transition-all"
                                disabled={isUpdating}
                            >
                                {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </header>
    )
}
