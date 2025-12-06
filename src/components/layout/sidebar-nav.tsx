
"use client"

import { Compass, Home, ListVideo, Newspaper, Users, History, Tv } from "lucide-react";

export const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/timeline", label: "Timeline", icon: History },
    { href: "/playlists", label: "Playlists", icon: ListVideo },
    { href: "/watch-parties", label: "Parties", icon: Tv },
    { href: "/social", label: "Social", icon: Users },
];
