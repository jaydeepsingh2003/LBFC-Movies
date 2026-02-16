'use client';

import { useState, useEffect } from "react";
import { MovieCarousel } from "../movie-carousel";
import { getNowPlayingMovies, getPosterUrl } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";

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

    return <MovieCarousel title="In Theaters" movies={movies} />;
}
