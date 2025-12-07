"use client"

import { Compass, Home, ListVideo, Users, Tv, UserSquare, User as UserIcon, Music } from "lucide-react";

export const allNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/tv", label: "TV Shows", icon: Tv},
    { href: "/music", label: "Music", icon: Music },
    { href: "/playlists", label: "Playlists", icon: ListVideo },
    { href: "/people", label: "People", icon: UserSquare},
    { href: "/social", label: "Social", icon: Users },
];

export const mobileNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/tv", label: "TV Shows", icon: Tv},
    { href: "/music", label: "Music", icon: Music },
    { href: "/playlists", label: "Playlists", icon: ListVideo },
    { href: "/profile", label: "Profile", icon: UserIcon },
];

export const desktopNavItems = allNavItems;