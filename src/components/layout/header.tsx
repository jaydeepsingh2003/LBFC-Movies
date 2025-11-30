
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { CreditCard, Film, LogOut, Settings, User } from "lucide-react"
import { MovieSearch } from "../movie-search"
import { SidebarNav } from "./sidebar-nav"
import { useUser, logout } from "@/firebase/auth/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Header({ showSidebarTrigger = false }: { showSidebarTrigger?: boolean }) {
    const { user, isLoading } = useUser();
    const avatar = PlaceHolderImages.find(p => p.id === 'avatar-1');
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-transparent bg-gradient-to-b from-background to-transparent px-4 backdrop-blur-sm md:px-8">
            {showSidebarTrigger && <SidebarTrigger className="md:hidden" />}
            <div className="flex items-center gap-2">
                 <Film className="size-8 text-primary" />
                 <h1 className="font-headline text-2xl font-bold text-primary tracking-wider hidden md:block">LBFC</h1>
            </div>
            <div className="ml-6 hidden md:flex">
                <SidebarNav />
            </div>
            <div className="ml-auto flex items-center gap-4">
                <MovieSearch />
                {isLoading ? (
                    <div className="h-10 w-10 rounded-full bg-secondary animate-pulse" />
                ) : user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10 border-2 border-primary">
                                    <AvatarImage src={user.photoURL || avatar?.imageUrl} alt="User Avatar" />
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
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
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
