import { Compass, Home, ListVideo, Newspaper, Users } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";

export function SidebarNav() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton href="#" isActive tooltip="Home">
                    <Home />
                    Home
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Discover">
                    <Compass />
                    Discover
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Playlists">
                    <ListVideo />
                    Playlists
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Social">
                    <Users />
                    Social
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="News">
                    <Newspaper />
                    News
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
