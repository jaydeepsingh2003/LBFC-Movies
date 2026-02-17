"use client"

import { Compass, Home, ListVideo, Users, Tv, UserSquare, User as UserIcon, Music, Layers } from "lucide-react";

export const allNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/tv", label: "TV Shows", icon: Tv},
    { href: "/my-otts", label: "My OTTs", icon: Layers },
    { href: "/music", label: "Music", icon: Music },
    { href: "/playlists", label: "Playlists", icon: ListVideo },
    { href: "/people", label: "People", icon: UserSquare},
    { href: "/social", label: "Social", icon: Users },
    { href: "/profile", label: "Profile", icon: UserIcon },
];

export const mobileNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/my-otts", label: "My OTTs", icon: Layers },
    { href: "/music", label: "Music", icon: Music },
    { href: "/playlists", label: "Playlists", icon: ListVideo },
    { href: "/people", label: "People", icon: UserSquare },
];

export const desktopNavItems = allNavItems;
