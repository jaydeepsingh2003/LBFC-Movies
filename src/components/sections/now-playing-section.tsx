'use client';

import { useState, useEffect } from "react";
import { getNowPlayingMovies, getPosterUrl } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import { Ticket } from "lucide-react";
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
        <section className="py-6 space-y-8 border-b border-white/5">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Ticket className="text-yellow-500 size-6 md:size-7" />
                    </div>
                    <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase text-white mb-0">
                        In <span className="text-yellow-500">Theaters</span>
                    </h2>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-12 md:ml-14">Global blockbusters and regional hits playing in cinemas near you.</p>
            </div>

            <div className="min-h-[350px] relative">
                {isLoading ? (
                    <div className="flex gap-4 overflow-hidden">
                        {[...Array(7)].map((_, i) => (
                            <Skeleton key={i} className="aspect-[2/3] w-40 md:w-56 flex-shrink-0 rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <Carousel opts={{ align: 'start', loop: false, dragFree: true }} className="w-full">
                        <CarouselContent className="-ml-4 md:-ml-6">
                            {movies.map((movie) => (
                                <CarouselItem key={movie.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/7 pl-4 md:pl-6">
                                    <MovieCard 
                                        id={movie.id!} 
                                        title={movie.title!} 
                                        posterUrl={movie.posterUrl} 
                                        overview={movie.overview}
                                        poster_path={movie.poster_path}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex -left-12 h-12 w-12 glass-panel border-none hover:bg-primary shadow-2xl" />
                        <CarouselNext className="hidden md:flex -right-12 h-12 w-12 glass-panel border-none hover:bg-primary shadow-2xl" />
                    </Carousel>
                )}
            </div>
        </section>
    );
}
