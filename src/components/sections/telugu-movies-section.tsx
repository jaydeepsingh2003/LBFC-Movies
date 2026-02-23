"use client";

import { useState, useEffect } from "react";
import { MovieCarousel } from "../movie-carousel";
import { discoverMovies, getPosterUrl, getMovieVideos } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import { Globe, Languages } from "lucide-react";

interface MovieWithPoster extends Partial<Movie> {
    posterUrl: string | null;
    title: string;
}

export default function TeluguMoviesSection() {
    const [moviesData, setMoviesData] = useState<MovieWithPoster[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const fetchedMovies = await discoverMovies({ with_original_language: 'te' });
                
                const moviePromises = fetchedMovies.map(async (movie) => {
                    const videos = await getMovieVideos(movie.id);
                    const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
                    return {
                        ...movie,
                        posterUrl: getPosterUrl(movie.poster_path),
                        trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
                    };
                });
                
                const moviesWithDetails = await Promise.all(moviePromises);
                setMoviesData(moviesWithDetails as MovieWithPoster[]);
            } catch (error) {
                console.error("Failed to fetch Telugu movies:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    if (isLoading) {
        return (
             <div className="py-12 space-y-8 border-t border-white/5">
                <Skeleton className="h-10 w-64 rounded-full bg-red-600/10" />
                <div className="flex gap-6 overflow-x-auto pb-4">
                    {[...Array(7)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-48 md:w-64 flex-shrink-0 rounded-[2rem] bg-secondary/20" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <section className="py-16 space-y-12 border-t border-white/5">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600/10 rounded-2xl border border-red-600/20 shadow-2xl shadow-red-600/10">
                    <Languages className="text-red-600 size-7 md:size-8" />
                </div>
                <div className="space-y-1">
                    <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter uppercase text-white mb-0 leading-none">
                        Linguistic <span className="text-red-600">Hub: Telugu</span>
                    </h2>
                    <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">Tollywood blockbusters and award-winning narratives.</p>
                </div>
            </div>
            <MovieCarousel title="" movies={moviesData} />
        </section>
    );
}