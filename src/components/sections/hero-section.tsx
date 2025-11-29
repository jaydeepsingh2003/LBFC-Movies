
"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button";
import { Info, PlayCircle } from "lucide-react";
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { getPosterUrl, searchMovies } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import { getBackdropUrl } from "@/lib/tmdb.client";


interface MovieWithImages extends Movie {
    backdropUrl: string | null;
    posterUrl: string | null;
}

export default function HeroSection() {
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    )
    const [movies, setMovies] = React.useState<MovieWithImages[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchHeroMovies() {
            setIsLoading(true);
            const heroMovieTitles = [
                "Dune: Part Two",
                "Godzilla x Kong: The New Empire",
                "Kung Fu Panda 4",
                "Furiosa: A Mad Max Saga",
                "The Fall Guy",
                "Inside Out 2",
                "Kingdom of the Planet of the Apes",
                "Bad Boys: Ride or Die",
                "A Quiet Place: Day One",
            ];
            try {
                const searchPromises = heroMovieTitles.map(title => searchMovies(title));
                const searchResults = await Promise.all(searchPromises);

                const moviesData = searchResults.map((result, index) => {
                    const movie = result.length > 0 ? result[0] : null;
                    return {
                        id: movie?.id ?? index,
                        title: movie ? movie.title : heroMovieTitles[index],
                        overview: movie?.overview ?? '',
                        poster_path: movie?.poster_path ?? null,
                        backdrop_path: movie?.backdrop_path ?? null,
                        backdropUrl: movie ? getBackdropUrl(movie.backdrop_path) : null,
                        posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
                    };
                }).filter(movie => movie.backdropUrl); // Only include movies with backdrops
                setMovies(moviesData);
            } catch (error) {
                console.error("Failed to fetch hero movies:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchHeroMovies();
    }, []);

    if (isLoading) {
        return (
            <div className="relative h-[56.25vw] min-h-[300px] max-h-[80vh] w-full">
                <Skeleton className="w-full h-full" />
                <div className="absolute bottom-[20%] left-4 md:left-8 lg:left-16 max-w-lg space-y-4">
                    <Skeleton className="h-16 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                    <div className="flex gap-3 pt-2">
                        <Skeleton className="h-12 w-32" />
                        <Skeleton className="h-12 w-32" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselContent>
                {movies.map((movie) => {
                    return (
                        <CarouselItem key={movie.id}>
                            <div className="relative h-[56.25vw] min-h-[300px] max-h-[80vh] w-full">
                                {movie.backdropUrl && (
                                    <Image
                                        src={movie.backdropUrl}
                                        alt={movie.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
                                
                                <div className="absolute bottom-[20%] left-4 md:left-8 lg:left-16 max-w-lg">
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-white drop-shadow-lg animate-in fade-in slide-in-from-bottom-10 duration-700">
                                        {movie.title}
                                    </h1>
                                    <p className="mt-4 text-sm md:text-base text-white/90 drop-shadow-md line-clamp-3 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
                                        {movie.overview}
                                    </p>
                                    <div className="mt-6 flex gap-3 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-200">
                                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                                            <PlayCircle className="mr-2" /> Play
                                        </Button>
                                        <Button size="lg" variant="secondary" className="bg-white/30 hover:bg-white/20 text-white backdrop-blur-sm font-bold">
                                            <Info className="mr-2" /> More Info
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    )
                })}
            </CarouselContent>
        </Carousel>
    );
}
