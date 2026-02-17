
"use client";

import { useState, useEffect } from "react";
import { getMovieVideos, getPosterUrl, getCollection } from "@/lib/tmdb.client";
import { MovieCarousel } from "../movie-carousel";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import { Layers } from "lucide-react";

interface MovieWithPoster extends Partial<Movie> {
  posterUrl: string | null;
  title: string;
}

const POPULAR_FRANCHISES = [
    { id: 87359, name: "Mission: Impossible" },
    { id: 403371, name: "John Wick" },
    { id: 9485, name: "Fast & Furious" },
    { id: 10, name: "Star Wars" },
    { id: 86311, name: "The Avengers" },
    { id: 263, name: "The Dark Knight" },
    { id: 1241, name: "Harry Potter" },
    { id: 645, name: "James Bond" },
    { id: 531241, name: "Spider-Man" },
    { id: 8650, name: "Transformers" },
];

export default function FranchiseFocusSection() {
    const [moviesData, setMoviesData] = useState<MovieWithPoster[]>([]);
    const [franchiseName, setFranchiseName] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            setIsLoading(true);
            try {
                // Select a random franchise from our curated list
                const randomFranchise = POPULAR_FRANCHISES[Math.floor(Math.random() * POPULAR_FRANCHISES.length)];
                const collection = await getCollection(randomFranchise.id);

                if (collection && collection.parts) {
                    setFranchiseName(collection.name);
                    
                    const moviePromises = collection.parts.map(async (movie: any) => {
                        const videos = await getMovieVideos(movie.id);
                        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
                        return {
                            id: movie.id,
                            title: movie.title,
                            posterUrl: getPosterUrl(movie.poster_path),
                            overview: movie.overview,
                            trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
                        };
                    });

                    const resolvedMovies = await Promise.all(moviePromises);
                    setMoviesData(resolvedMovies.filter(m => m.posterUrl));
                }
            } catch (error) {
                console.error("Failed to fetch franchise movies:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchMovies();
    }, []);

    if (isLoading) {
         return (
             <div className="py-4 space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <div className="flex gap-4 overflow-hidden">
                    {[...Array(7)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-40 md:w-56 flex-shrink-0 rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    if (moviesData.length === 0) return null;

    return (
        <section className="py-4 space-y-8 border-b border-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-400/10 rounded-lg border border-blue-400/20">
                    <Layers className="text-blue-400 size-6 md:size-7" />
                </div>
                <div className="space-y-1">
                    <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase text-white mb-0">
                        Franchise <span className="text-blue-400">Focus: {franchiseName}</span>
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Deep dives into the worlds most successful cinematic universes.</p>
                </div>
            </div>
            <MovieCarousel title="" movies={moviesData} />
        </section>
    );
}
