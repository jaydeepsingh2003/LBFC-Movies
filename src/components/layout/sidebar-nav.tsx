"use client"

import { Compass, Home, ListVideo, Newspaper, Users } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function SidebarNav() {
    const { state } = useSidebar() ?? { state: 'expanded' };
    const pathname = usePathname();

    const buttonProps = state === 'expanded' ? {} : {
        variant: "ghost" as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined,
        className: "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
    }

    return (
        <SidebarMenu className="md:flex-row md:gap-1">
            <SidebarMenuItem>
                <SidebarMenuButton href="/" isActive={pathname === '/'} tooltip="Home" {...buttonProps}>
                    <Home />
                    Home
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton href="/discover" isActive={pathname === '/discover'} tooltip="Discover" {...buttonProps}>
                    <Compass />
                    Discover
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Playlists" {...buttonProps}>
                    <ListVideo />
                    Playlists
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Social" {...buttonProps}>
                    <Users />
                    Social
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="News" {...buttonProps}>
                    <Newspaper />
                    News
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
