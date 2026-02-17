'use client';

import { useState, useEffect } from "react";
import { MovieCarousel } from "../movie-carousel";
import { getNowPlayingMovies, getPosterUrl } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import { Ticket } from "lucide-react";

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

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h2 className="section-title mb-0">
                    <Ticket className="text-primary size-6" />
                    In Theaters
                </h2>
                <p className="text-sm font-medium text-muted-foreground">Global blockbusters and regional hits playing in cinemas near you.</p>
            </div>
            <MovieCarousel title="" movies={movies} />
        </div>
    );
}
