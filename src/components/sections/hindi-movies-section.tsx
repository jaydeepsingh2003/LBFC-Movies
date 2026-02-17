
"use client";

import { useState, useEffect } from "react";
import { MovieCarousel } from "../movie-carousel";
import { discoverMovies, getPosterUrl, getMovieVideos } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import { Globe } from "lucide-react";

interface MovieWithPoster extends Partial<Movie> {
    posterUrl: string | null;
    title: string;
}

export default function HindiMoviesSection() {
    const [moviesData, setMoviesData] = useState<MovieWithPoster[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const fetchedMovies = await discoverMovies({ with_original_language: 'hi' });
                
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
                console.error("Failed to fetch Hindi movies:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    if (isLoading) {
        return (
             <div className="py-4 space-y-4">
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
        <section className="py-4 space-y-8 border-b border-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <Globe className="text-orange-500 size-6 md:size-7" />
                </div>
                <div className="space-y-1">
                    <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase text-white mb-0">
                        Popular in <span className="text-orange-500">Hindi</span>
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">The finest Bollywood storytelling trending right now.</p>
                </div>
            </div>
            <MovieCarousel title="" movies={moviesData} />
        </section>
    );
}
