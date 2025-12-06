
"use client";

import { useState, useEffect } from "react";
import { getPosterUrl, discoverTvShows } from "@/lib/tmdb.client";
import { TVShow } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { TVShowCard } from "../tv-show-card";

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
            try {
                const fetchedShows = await discoverTvShows({ language: 'en' });
                const showsWithPosters = fetchedShows.map(show => ({
                    ...show,
                    id: show.id,
                    title: show.name,
                    posterUrl: getPosterUrl(show.poster_path),
                }));
                setShows(showsWithPosters);
            } catch (error) {
                console.error("Failed to fetch English TV shows:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchShows();
    }, []);

    if (isLoading) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {[...Array(7)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-48 md:w-56 flex-shrink-0 rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return (
         <div className="space-y-4">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Popular English TV Shows</h2>
             {shows.length > 0 ? (
                <Carousel
                opts={{
                    align: "start",
                    loop: false,
                    dragFree: true,
                }}
                className="w-full"
                >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {shows.map((show, index) => (
                    <CarouselItem key={show.id || index} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/7 pl-2 md:pl-4">
                        <TVShowCard id={show.id!} title={show.title} posterUrl={show.posterUrl} />
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="ml-12 bg-background/50 hover:bg-background" />
                <CarouselNext className="mr-12 bg-background/50 hover:bg-background" />
                </Carousel>
            ) : (
                <p className="text-muted-foreground">No shows to display right now.</p>
            )}
        </div>
    );
}
