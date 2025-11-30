
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

export default function TamilMoviesSection() {
    const [moviesData, setMoviesData] = useState<MovieWithPoster[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const tamilMovies = [
                "Vikram",
                "Kaithi",
                "96",
                "Super Deluxe",
                "Vada Chennai",
                "Anbe Sivam",
                "Soorarai Pottru",
                "Asuran",
                "Pariyerum Perumal",
                "Ratsasan"
            ];

            const moviePromises = tamilMovies.map(async (title) => {
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
                .filter(movie => movie !== null)
                .map(movie => ({
                    id: movie!.id,
                    title: movie!.title,
                    poster_path: movie!.poster_path || null,
                    overview: movie!.overview || '',
                    backdrop_path: movie!.backdrop_path || null,
                    posterUrl: movie ? getPosterUrl(movie!.poster_path) : null,
                    trailerUrl: movie!.trailerUrl,
                }));
                
            setMoviesData(fetchedMovies);
            setIsLoading(false);
        }
        fetchData();
    }, []);

    if (isLoading) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <div className="flex gap-4">
                    {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-1/6 rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return <MovieCarousel title="Popular in Tamil" movies={moviesData} />;
}
