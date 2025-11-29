
"use client";

import { useState, useEffect } from "react";
import { languageBasedMoviePicks } from "@/ai/flows/language-based-movie-picks";
import { MovieCarousel } from "../movie-carousel";
import { searchMovies, getPosterUrl, getMovieVideos } from "@/lib/tmdb.client";
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
            let recommendations: string[] = [];
            try {
                const result = await languageBasedMoviePicks({ languages: ["Kannada"], numberOfRecommendations: 15 });
                recommendations = result.movieRecommendations.filter(title => title.toLowerCase() !== 'lucia');
            } catch (error) {
                console.error("AI recommendations error for Kannada movies:", error)
            }
            
            const moviePromises = recommendations.map(async (title) => {
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
                .map((movie) => ({
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
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-1/6 rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return <MovieCarousel title="Popular in Kannada" movies={moviesData} />;
}
