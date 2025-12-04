
"use client"

import { Compass, Home, ListVideo, Newspaper, Users, History } from "lucide-react";

export const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/timeline", label: "Timeline", icon: History },
    { href: "/playlists", label: "Playlists", icon: ListVideo },
    { href: "/social", label: "Social", icon: Users },
    { href: "/news", label: "News", icon: Newspaper },
];
