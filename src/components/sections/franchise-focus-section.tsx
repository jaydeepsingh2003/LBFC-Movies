"use client";

import { useState, useEffect } from "react";
import { getMovieVideos, getPosterUrl, searchMovies } from "@/lib/tmdb.client";
import { MovieCarousel } from "../movie-carousel";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import { Layers } from "lucide-react";

interface MovieWithPoster extends Partial<Movie> {
  posterUrl: string | null;
  title: string;
}

export default function FranchiseFocusSection() {
    const [moviesData, setMoviesData] = useState<MovieWithPoster[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            setIsLoading(true);
            const franchiseMovies = [
                "Mission: Impossible - Fallout",
                "John Wick: Chapter 4",
                "Mission: Impossible - Ghost Protocol",
                "John Wick: Chapter 3 - Parabellum",
                "Mission: Impossible - Rogue Nation",
                "John Wick: Chapter 2",
                "The Bourne Ultimatum",
                "Casino Royale",
                "Skyfall",
                "The Dark Knight"
            ];

            let fetchedMoviesData: MovieWithPoster[] = [];
            try {
                const searchPromises = franchiseMovies.map(async (title) => {
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
                        title: movie ? movie.title : franchiseMovies[index],
                        posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
                        overview: movie?.overview || '',
                        trailerUrl: movie?.trailerUrl,
                    };
                });

            } catch (error) {
                console.error("Failed to fetch franchise movies:", error);
            }
            setMoviesData(fetchedMoviesData);
            setIsLoading(false);
        }
        fetchMovies();
    }, []);

    if (isLoading) {
         return (
             <div className="py-12 space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <div className="flex gap-4">
                    {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-1/6 rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <section className="py-12 space-y-8 border-b border-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-400/10 rounded-lg border border-blue-400/20">
                    <Layers className="text-blue-400 size-6 md:size-7" />
                </div>
                <div className="space-y-1">
                    <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase text-white mb-0">
                        Franchise <span className="text-blue-400">Focus</span>
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Deep dives into the worlds most successful cinematic universes.</p>
                </div>
            </div>
            <MovieCarousel title="" movies={moviesData} />
        </section>
    );
}
