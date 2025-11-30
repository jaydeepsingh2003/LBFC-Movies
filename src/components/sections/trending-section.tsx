
"use client";

import { useState, useEffect } from "react";
import { MovieCarousel } from "../movie-carousel";
import { getPosterUrl, getMovieVideos, searchMovies } from "@/lib/tmdb.client";
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
            const trendingMovies = [
                "Oppenheimer",
                "Barbie",
                "Spider-Man: Across the Spider-Verse",
                "Poor Things",
                "The Holdovers",
                "Past Lives"
            ];
            
            const moviePromises = trendingMovies.map(async (title) => {
                const searchResults = await searchMovies(title);
                const movie = searchResults.length > 0 ? searchResults[0] : null;
                if (movie) {
                    const videos = await getMovieVideos(movie.id);
                    const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
                    movie.trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;
                }
                return movie;
            });

            const fetchedMovies = (await Promise.all(moviePromises))
                .map((movie, index) => ({
                    id: movie?.id,
                    title: movie ? movie.title : trendingMovies[index],
                    poster_path: movie?.poster_path || null,
                    overview: movie?.overview || '',
                    backdrop_path: movie?.backdrop_path || null,
                    posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
                    trailerUrl: movie?.trailerUrl,
                }));
            
            setMovies(fetchedMovies);
            setIsLoading(false);
        }

        fetchTrending();
    }, []);

    if (isLoading) {
         return (
             <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <div className="flex gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-1/6 rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return <MovieCarousel title="Trending Now" movies={movies} />;
}
