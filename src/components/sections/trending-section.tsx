'use client';

import { useState, useEffect } from "react";
import { MovieCarousel } from "../movie-carousel";
import { getPosterUrl, getTrendingMovies } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";

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

    return <MovieCarousel title="Trending Now" movies={movies} />;
}
