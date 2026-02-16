"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button";
import { Info, PlayCircle } from "lucide-react";
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { getPopularMovies, getMovieVideos, getBackdropUrl } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import { useVideoPlayer } from "@/context/video-provider";
import Link from "next/link";

interface MovieWithImages extends Movie {
    backdropUrl: string | null;
}

export default function HeroSection() {
    const plugin = React.useRef(
        Autoplay({ delay: 6000, stopOnInteraction: true })
    )
    const [movies, setMovies] = React.useState<MovieWithImages[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { setVideoId } = useVideoPlayer();

    React.useEffect(() => {
        async function fetchHeroMovies() {
            setIsLoading(true);
            try {
                const popularMovies = await getPopularMovies();
                const topMovies = popularMovies.slice(0, 10);

                const moviesDataPromises = topMovies.map(async (movie) => {
                    const videos = await getMovieVideos(movie.id);
                    const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
                    return {
                        ...movie,
                        backdropUrl: movie.backdrop_path ? getBackdropUrl(movie.backdrop_path) : null,
                        trailerUrl: trailer ? trailer.key : undefined,
                    };
                });

                const moviesData = (await Promise.all(moviesDataPromises))
                    .filter((movie): movie is MovieWithImages => !!movie.backdropUrl);

                setMovies(moviesData);
            } catch (error) {
                console.error("Failed to fetch hero movies:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchHeroMovies();
    }, []);

    const handlePlayTrailer = (e: React.MouseEvent, videoId: string | undefined) => {
        e.preventDefault();
        if (videoId) {
            setVideoId(videoId);
        }
    };

    if (isLoading) {
        return (
            <div className="relative h-[70vh] md:h-[80vh] w-full">
                <Skeleton className="w-full h-full" />
                <div className="absolute bottom-[15%] left-4 md:left-8 lg:left-16 max-w-lg space-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex gap-3 pt-4">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
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
                {movies.map((movie) => (
                    <CarouselItem key={movie.id}>
                        <div className="relative h-[70vh] md:h-[85vh] w-full group">
                            {movie.backdropUrl && (
                                <Image
                                    src={movie.backdropUrl}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="100vw"
                                />
                            )}
                            {/* Overlays for readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-80" />
                            
                            <div className="absolute bottom-[10%] md:bottom-[15%] left-4 md:left-8 lg:left-16 max-w-2xl px-2">
                                <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline font-bold text-white drop-shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-700">
                                    {movie.title}
                                </h1>
                                <p className="mt-4 text-sm md:text-lg text-white/90 drop-shadow-lg line-clamp-3 md:line-clamp-4 max-w-xl animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100 font-medium">
                                    {movie.overview}
                                </p>
                                <div className="mt-8 flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-200">
                                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-8 h-12" onClick={(e) => handlePlayTrailer(e, movie.trailerUrl)}>
                                        <PlayCircle className="mr-2 size-5" /> Play Trailer
                                    </Button>
                                    <Button size="lg" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 font-bold rounded-full px-8 h-12" asChild>
                                        <Link href={`/movie/${movie.id}`}>
                                            <Info className="mr-2 size-5" /> Details
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    );
}
