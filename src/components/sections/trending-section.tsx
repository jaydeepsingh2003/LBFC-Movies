'use client';

import { useState, useEffect } from "react";
import { MovieCarousel } from "../movie-carousel";
import { getPosterUrl, getTrendingMovies } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import { TrendingUp } from "lucide-react";

interface MovieWithPoster extends Partial<Movie> {
  posterUrl: string | null;
  title: string;
}

export default function TrendingSection() {
    const [movies, setMovies] = useState<MovieWithPoster[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            setIsLoading(true);
            try {
                const trendingMovies = await getTrendingMovies();
                const fetchedMovies = trendingMovies.map((movie) => ({
                    ...movie,
                    posterUrl: getPosterUrl(movie.poster_path),
                }));
                setMovies(fetchedMovies as MovieWithPoster[]);
            } catch (error) {
                console.error("Failed to fetch trending movies:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTrending();
    }, []);

    if (isLoading) {
         return (
             <div className="py-6 space-y-4">
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
        <section className="py-6 space-y-8 border-b border-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <TrendingUp className="text-red-500 size-6 md:size-7" />
                </div>
                <div className="space-y-1">
                    <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase text-white mb-0">
                        Trending <span className="text-red-500">Now</span>
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">The hottest titles climbing the charts this week.</p>
                </div>
            </div>
            <MovieCarousel title="" movies={movies} />
        </section>
    );
}
