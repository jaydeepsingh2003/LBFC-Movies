"use client";

import { useState, useEffect } from "react";
import { getNowPlayingMovies, getPosterUrl } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import { Ticket, Clapperboard } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { MovieCard } from "../movie-card";

interface MovieWithPoster extends Partial<Movie> {
  posterUrl: string | null;
  title: string;
}

export default function NowPlayingSection() {
    const [movies, setMovies] = useState<MovieWithPoster[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNowPlaying = async () => {
            setIsLoading(true);
            try {
                const results = await getNowPlayingMovies('en-US', 'IN');
                const moviesWithDetails = results.map((movie) => ({
                    ...movie,
                    posterUrl: getPosterUrl(movie.poster_path),
                }));
                setMovies(moviesWithDetails as MovieWithPoster[]);
            } catch (error) {
                console.error("Failed to fetch now playing movies:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNowPlaying();
    }, []);

    return (
        <section className="py-16 space-y-12 border-t border-white/5 relative">
            <div className="space-y-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-2xl shadow-red-500/10">
                        <Ticket className="text-red-500 size-7 md:size-8" />
                    </div>
                    <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter uppercase text-white mb-0 leading-none">
                        Now in <span className="text-red-500">Theaters</span>
                    </h2>
                </div>
                <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60 ml-16 md:ml-20">Global blockbusters and regional hits playing in cinemas near you.</p>
            </div>

            <div className="min-h-[400px] relative">
                {isLoading ? (
                    <div className="flex gap-8 overflow-hidden">
                        {[...Array(7)].map((_, i) => (
                            <Skeleton key={i} className="aspect-[2/3] w-48 md:w-64 flex-shrink-0 rounded-[2.5rem] bg-secondary/20" />
                        ))}
                    </div>
                ) : (
                    <Carousel opts={{ align: 'start', loop: false, dragFree: true }} className="w-full">
                        <CarouselContent className="-ml-4 md:-ml-8">
                            {movies.map((movie) => (
                                <CarouselItem key={movie.id} className="basis-[75%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6 pl-4 md:pl-8">
                                    <div className="transition-transform duration-500 hover:-translate-y-3">
                                        <MovieCard 
                                            id={movie.id!} 
                                            title={movie.title!} 
                                            posterUrl={movie.posterUrl} 
                                            overview={movie.overview}
                                            poster_path={movie.poster_path}
                                            className="shadow-2xl border-white/5"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden xl:flex -left-16 size-14 glass-panel border-white/10 hover:bg-primary shadow-2xl hover:text-white" />
                        <CarouselNext className="hidden xl:flex -right-16 size-14 glass-panel border-white/10 hover:bg-primary shadow-2xl hover:text-white" />
                    </Carousel>
                )}
            </div>
        </section>
    );
}