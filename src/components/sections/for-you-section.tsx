
"use client";

import { useState, useEffect } from "react";
import { MovieCarousel } from "../movie-carousel";
import { getPosterUrl, getMovieVideos, discoverMovies } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";

interface MovieWithPoster extends Partial<Movie> {
    posterUrl: string | null;
    title: string;
}

export default function ForYouSection() {
    const [moviesData, setMoviesData] = useState<MovieWithPoster[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const results = await Promise.all([
                    discoverMovies({ with_original_language: 'en', sort_by: 'popularity.desc' }, 1),
                    discoverMovies({ with_original_language: 'hi', sort_by: 'popularity.desc' }, 1),
                    discoverMovies({ with_original_language: 'kn', sort_by: 'popularity.desc' }, 1),
                ]);

                const combined = [...results[0].slice(0, 4), ...results[1].slice(0, 3), ...results[2].slice(0, 3)];
                const shuffled = combined.sort(() => 0.5 - Math.random());

                const moviePromises = shuffled.map(async (movie) => {
                    const videos = await getMovieVideos(movie.id);
                    const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
                    return {
                        ...movie,
                        posterUrl: getPosterUrl(movie.poster_path),
                        trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
                    };
                });

                const fetchedMoviesData = await Promise.all(moviePromises);
                setMoviesData(fetchedMoviesData as MovieWithPoster[]);

            } catch (error) {
                console.error("Failed to fetch 'For You' movies:", error);
            }
            
            setIsLoading(false);
        }
        fetchData();
    }, [])

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

    return <MovieCarousel title="For You" movies={moviesData} />;
}
