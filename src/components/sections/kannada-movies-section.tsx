
"use client";

import { useState, useEffect } from "react";
import { MovieCarousel } from "../movie-carousel";
import { discoverMovies, getPosterUrl, getMovieVideos } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";

interface MovieWithPoster extends Partial<Movie> {
    posterUrl: string | null;
    title: string;
}

export default function KannadaMoviesSection() {
    const [moviesData, setMoviesData] = useState<MovieWithPoster[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const fetchedMovies = await discoverMovies({ with_original_language: 'kn' });
                
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
                console.error("Failed to fetch Kannada movies:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
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

    return <MovieCarousel title="Popular in Kannada" movies={moviesData} />;
}
