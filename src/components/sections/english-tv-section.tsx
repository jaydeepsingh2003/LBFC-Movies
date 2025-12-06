
"use client";

import { useState, useEffect } from "react";
import { MovieCarousel } from "../movie-carousel";
import { getPosterUrl, getTvShowVideos, searchTvShows } from "@/lib/tmdb.client";
import { TVShow } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";

interface TVShowWithPoster extends Partial<TVShow> {
    posterUrl: string | null;
    title: string;
}

export default function EnglishTvSection() {
    const [shows, setShows] = useState<TVShowWithPoster[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchShows = async () => {
            setIsLoading(true);
            const showTitles = [
                "Breaking Bad",
                "Game of Thrones",
                "The Office",
                "Stranger Things",
                "The Mandalorian",
                "Friends",
                "The Simpsons",
                "Black Mirror",
                "The Crown",
                "Ted Lasso"
            ];
            
            const showPromises = showTitles.map(async (title) => {
                const searchResults = await searchTvShows(title);
                const show = searchResults.length > 0 ? searchResults[0] : null;
                if (show) {
                    const videos = await getTvShowVideos(show.id);
                    const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
                    show.trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;
                }
                return show;
            });

            const fetchedShows = (await Promise.all(showPromises))
                .filter(show => show !== null)
                .map((show, index) => ({
                    id: show!.id,
                    title: show!.name,
                    posterUrl: show ? getPosterUrl(show!.poster_path) : null,
                    trailerUrl: show!.trailerUrl,
                }));
            
            setShows(fetchedShows);
            setIsLoading(false);
        }
        fetchShows();
    }, []);

    if (isLoading) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-40 md:w-48 flex-shrink-0 rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return (
         <div className="space-y-4">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Popular English TV Shows</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {shows.map((s) => (
                   <Link key={s.id} href={`/tv/${s.id}`}>
                        <Card className="overflow-hidden border-none group bg-card">
                            <CardContent className="p-0 relative w-full aspect-[2/3]">
                                {s.posterUrl ? <Image src={s.posterUrl} alt={s.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" /> : null}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-2">
                                    <h3 className="font-semibold text-sm text-white shadow-md ">{s.title}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
