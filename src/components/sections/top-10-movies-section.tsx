
'use client';

import { useState, useEffect } from "react";
import { getPopularMovies, getPosterUrl } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { MovieCard } from "../movie-card";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Top10MoviesSection() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTop10 = async () => {
            setIsLoading(true);
            try {
                const results = await getPopularMovies();
                setMovies(results.slice(0, 10));
            } catch (error) {
                console.error("Failed to fetch top 10 movies:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTop10();
    }, []);

    if (isLoading) {
        return (
            <div className="py-4 space-y-8">
                <Skeleton className="h-10 w-64" />
                <div className="flex gap-6 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-64 flex-shrink-0 rounded-2xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <section className="py-4 space-y-8 border-b border-white/5 relative">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <Trophy className="text-yellow-500 size-6 md:size-8" />
                </div>
                <div className="space-y-1">
                    <h2 className="font-headline text-2xl md:text-4xl font-black tracking-tighter uppercase text-white mb-0">
                        Top 10 <span className="text-yellow-500">Global Hits</span>
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">The most watched cinematic masterpieces worldwide today.</p>
                </div>
            </div>

            <Carousel opts={{ align: 'start', loop: false, dragFree: true }} className="w-full">
                <CarouselContent className="-ml-4 md:-ml-8">
                    {movies.map((movie, index) => (
                        <CarouselItem key={movie.id} className="basis-[75%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-4 md:pl-8">
                            <div className="relative group h-full py-4">
                                <div className={cn(
                                    "absolute bottom-4 z-0 select-none pointer-events-none transition-all duration-500",
                                    index === 9 ? "-left-12 md:-left-20" : "-left-4 md:-left-8"
                                )}>
                                    <span className={cn(
                                        "text-[120px] md:text-[200px] font-black leading-none text-transparent",
                                        index === 9 && "tracking-tighter"
                                    )} 
                                          style={{ WebkitTextStroke: '2px rgba(255,255,255,0.15)' }}>
                                        {index + 1}
                                    </span>
                                </div>
                                
                                <div className="relative z-10 pl-10 md:pl-16 transform transition-all duration-500 group-hover:-translate-y-3 group-hover:scale-[1.02]">
                                    <MovieCard 
                                        id={movie.id} 
                                        title={movie.title} 
                                        posterUrl={getPosterUrl(movie.poster_path)}
                                        overview={movie.overview}
                                        poster_path={movie.poster_path}
                                    />
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-12 h-12 w-12 glass-panel border-none hover:bg-primary shadow-2xl" />
                <CarouselNext className="hidden md:flex -right-12 h-12 w-12 glass-panel border-none hover:bg-primary shadow-2xl" />
            </Carousel>
        </section>
    );
}
