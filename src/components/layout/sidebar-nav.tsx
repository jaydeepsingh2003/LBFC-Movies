
"use client"

import { Compass, Home, ListVideo, Newspaper, Users, History } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/timeline", label: "Timeline", icon: History },
    { href: "/playlists", label: "Playlists", icon: ListVideo },
    { href: "/social", label: "Social", icon: Users },
    { href: "/news", label: "News", icon: Newspaper },
];

export function SidebarNav() {
    const { state } = useSidebar() ?? { state: 'expanded' };
    const pathname = usePathname();

    const buttonProps = state === 'expanded' ? {} : {
        variant: "ghost" as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined,
        className: "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
    }

    return (
        <SidebarMenu className="md:flex-row md:gap-1">
            {navItems.map((item) => (
                 <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton href={item.href} isActive={pathname === item.href} tooltip={item.label} {...buttonProps}>
                        <item.icon />
                        {item.label}
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}
