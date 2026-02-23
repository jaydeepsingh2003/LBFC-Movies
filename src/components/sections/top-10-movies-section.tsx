"use client";

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
            <div className="py-12 space-y-8 border-t border-white/5">
                <Skeleton className="h-12 w-72 rounded-full bg-yellow-500/10" />
                <div className="flex gap-8 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-64 flex-shrink-0 rounded-[2.5rem] bg-secondary/20" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <section className="py-16 space-y-12 border-t border-white/5 relative overflow-hidden">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 shadow-2xl shadow-yellow-500/10">
                    <Trophy className="text-yellow-500 size-7 md:size-8" />
                </div>
                <div className="space-y-1">
                    <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter uppercase text-white mb-0 leading-none">
                        Top 10 <span className="text-yellow-500">Global Hits</span>
                    </h2>
                    <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">The most watched cinematic masterpieces worldwide today.</p>
                </div>
            </div>

            <Carousel opts={{ align: 'start', loop: false, dragFree: true }} className="w-full">
                <CarouselContent className="-ml-4 md:-ml-8">
                    {movies.map((movie, index) => (
                        <CarouselItem key={movie.id} className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-4 md:pl-8">
                            <div className="relative group h-full py-6">
                                <div className={cn(
                                    "absolute bottom-6 z-0 select-none pointer-events-none transition-all duration-700 opacity-40 group-hover:opacity-100",
                                    index === 9 ? "-left-16 md:-left-24" : "-left-6 md:-left-10"
                                )}>
                                    <span className={cn(
                                        "text-[140px] md:text-[240px] font-black leading-none text-transparent transition-all duration-700 group-hover:scale-110",
                                        index === 9 && "tracking-tighter"
                                    )} 
                                          style={{ WebkitTextStroke: '2px rgba(255,255,255,0.2)' }}>
                                        {index + 1}
                                    </span>
                                </div>
                                
                                <div className="relative z-10 pl-12 md:pl-20 transform transition-all duration-700 group-hover:-translate-y-4 group-hover:scale-[1.03]">
                                    <MovieCard 
                                        id={movie.id} 
                                        title={movie.title} 
                                        posterUrl={getPosterUrl(movie.poster_path)}
                                        overview={movie.overview}
                                        poster_path={movie.poster_path}
                                        className="shadow-[0_30px_60px_rgba(0,0,0,0.8)] border-white/10"
                                    />
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden xl:flex -left-16 size-14 glass-panel border-white/10 hover:bg-yellow-500 hover:text-black shadow-2xl" />
                <CarouselNext className="hidden xl:flex -right-16 size-14 glass-panel border-white/10 hover:bg-yellow-500 hover:text-black shadow-2xl" />
            </Carousel>
        </section>
    );
}