
"use client";

import { useState, useEffect } from "react";
import { MovieCarousel } from "../movie-carousel";
import { searchMovies, getPosterUrl, getMovieVideos } from "@/lib/tmdb.client";
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
            const forYouMovies = [
                "The Shawshank Redemption",
                "The Dark Knight",
                "Forrest Gump",
                "Spirited Away",
                "The Lord of the Rings: The Return of the King",
                "Interstellar",
            ];

            let fetchedMoviesData: MovieWithPoster[] = [];
            try {
                const searchPromises = forYouMovies.map(async (title) => {
                    const searchResults = await searchMovies(title);
                    const movie = searchResults.length > 0 ? searchResults[0] : null;
                    if (movie) {
                        const videos = await getMovieVideos(movie.id);
                        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
                        movie.trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;
                    }
                    return movie;
                });

                const resolvedMovies = await Promise.all(searchPromises);

                fetchedMoviesData = resolvedMovies.map((movie, index) => {
                    return {
                        id: movie?.id,
                        title: movie ? movie.title : forYouMovies[index],
                        posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
                        overview: movie?.overview || '',
                        trailerUrl: movie?.trailerUrl,
                    };
                });

            } catch (error) {
                console.error("Failed to fetch 'For You' movies:", error);
            }
            
            setMoviesData(fetchedMoviesData);
            setIsLoading(false);
        }
        fetchData();
    }, [])

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

    return <MovieCarousel title="For You" movies={moviesData} />;
}
