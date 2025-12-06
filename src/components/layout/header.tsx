
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreditCard, Film, LogOut, Settings, User } from "lucide-react"
import { MovieSearch } from "../movie-search"
import { useUser, logout } from "@/firebase/auth/auth-client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { navItems } from "./sidebar-nav";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { AppLayout } from "./app-layout";

export function DesktopNav() {
    const pathname = usePathname();
    return (
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "transition-colors hover:text-foreground",
                        pathname === item.href && "text-foreground font-semibold"
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
        <header className="sticky top-0 z-30 flex h-16 items-center gap-8 border-b bg-background/95 px-4 backdrop-blur-sm md:px-8">
            <div className="flex items-center gap-2">
                 <Link href="/"><Film className="size-8 text-primary" /></Link>
                 <h1 className="font-headline text-2xl font-bold text-primary tracking-wider hidden md:block">LBFC</h1>
            </div>
            
            <DesktopNav />
            
            <div className="ml-auto flex items-center gap-4">
                <div className="hidden md:block">
                  <MovieSearch />
                </div>
                {(!isClient || isLoading) ? (
                    <div className="h-10 w-10 rounded-full bg-secondary animate-pulse" />
                ) : user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10 border-2 border-primary">
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
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                )}
            </div>
        </header>
    )
}
