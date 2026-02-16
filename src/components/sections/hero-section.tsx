"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button";
import { Info, Play, Plus, Loader2 } from "lucide-react";
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { getPopularMovies, getMovieVideos, getBackdropUrl } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import { useVideoPlayer } from "@/context/video-provider";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface MovieWithImages extends Movie {
    backdropUrl: string | null;
    trailerUrl?: string;
}

export default function HeroSection() {
    const plugin = React.useRef(
        Autoplay({ delay: 8000, stopOnInteraction: true })
    )
    const [movies, setMovies] = React.useState<MovieWithImages[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { setVideoId } = useVideoPlayer();

    React.useEffect(() => {
        async function fetchHeroMovies() {
            setIsLoading(true);
            try {
                const popularMovies = await getPopularMovies();
                if (!popularMovies || popularMovies.length === 0) {
                    setMovies([]);
                    return;
                }

                const topMovies = popularMovies.slice(0, 10);

                const moviesDataPromises = topMovies.map(async (movie) => {
                    try {
                        const videos = await getMovieVideos(movie.id);
                        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
                        return {
                            ...movie,
                            backdropUrl: movie.backdrop_path ? getBackdropUrl(movie.backdrop_path) : null,
                            trailerUrl: trailer ? trailer.key : undefined,
                        };
                    } catch (err) {
                        return {
                            ...movie,
                            backdropUrl: movie.backdrop_path ? getBackdropUrl(movie.backdrop_path) : null,
                        };
                    }
                });

                const moviesData = (await Promise.all(moviesDataPromises))
                    .filter((movie): movie is MovieWithImages => !!movie.backdropUrl);

                setMovies(moviesData);
            } catch (error) {
                console.error("Failed to fetch hero movies:", error);
                setMovies([]);
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
            <div className="relative h-[70vh] md:h-[90vh] w-full bg-secondary/10">
                <Skeleton className="w-full h-full rounded-none" />
                <div className="absolute bottom-[20%] left-4 md:left-12 lg:left-24 max-w-2xl space-y-6 z-10">
                    <Skeleton className="h-16 md:h-24 w-3/4" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="flex gap-4 pt-6">
                        <Skeleton className="h-14 w-40 rounded-full" />
                        <Skeleton className="h-14 w-40 rounded-full" />
                    </div>
                </div>
            </div>
        )
    }

    // If no movies found, don't render a blank space
    if (movies.length === 0) return null;

    return (
        <div className="relative w-full h-[70vh] md:h-[95vh] bg-background overflow-hidden">
            {/* Fallback background if images fail to load */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background animate-pulse" />
            
            <Carousel
                plugins={[plugin.current]}
                className="w-full h-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                opts={{
                    loop: true,
                }}
            >
                <CarouselContent className="h-[70vh] md:h-[95vh] ml-0">
                    {movies.map((movie) => (
                        <CarouselItem key={movie.id} className="h-full w-full pl-0 relative">
                            <div className="relative h-full w-full">
                                {movie.backdropUrl && (
                                    <Image
                                        src={movie.backdropUrl}
                                        alt={movie.title}
                                        fill
                                        className="object-cover object-top md:object-center transition-opacity duration-1000"
                                        priority
                                        sizes="100vw"
                                    />
                                )}
                                
                                {/* Cinematic Overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent hidden lg:block" />
                                <div className="absolute inset-0 bg-black/30 lg:bg-black/10" />
                                
                                <div className="absolute bottom-[10%] md:bottom-[15%] lg:bottom-[20%] left-4 md:left-12 lg:left-24 max-w-4xl px-2 z-20">
                                    <div className="space-y-4 md:space-y-6">
                                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-10 duration-700">
                                            <Badge className="bg-primary font-black uppercase text-[10px] md:text-xs px-3 py-1 rounded-sm">Featured</Badge>
                                            <Badge variant="outline" className="border-white/40 text-white font-bold backdrop-blur-md text-[10px] md:text-xs">
                                                4K Ultra HD
                                            </Badge>
                                        </div>
                                        
                                        <h1 className="hero-title text-white animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100">
                                            {movie.title}
                                        </h1>
                                        
                                        <p className="text-base md:text-xl text-white/80 line-clamp-2 md:line-clamp-4 max-w-2xl font-medium leading-relaxed drop-shadow-xl animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                                            {movie.overview}
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-3 md:gap-4 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
                                            <Button 
                                                size="lg" 
                                                className="bg-white text-black hover:bg-white/90 font-black rounded-full px-6 md:px-10 h-12 md:h-14 shadow-2xl transition-transform hover:scale-105 active:scale-95" 
                                                onClick={(e) => handlePlayTrailer(e, movie.trailerUrl)}
                                            >
                                                <Play className="mr-2 md:mr-3 size-5 md:size-6 fill-current" /> Play Now
                                            </Button>
                                            
                                            <Button 
                                                size="lg" 
                                                variant="secondary" 
                                                className="bg-secondary/40 hover:bg-secondary/60 text-white backdrop-blur-xl border border-white/10 font-bold rounded-full px-6 md:px-10 h-12 md:h-14 transition-transform hover:scale-105 active:scale-95" 
                                                asChild
                                            >
                                                <Link href={`/movie/${movie.id}`}>
                                                    <Info className="mr-2 md:mr-3 size-5 md:size-6" /> More Info
                                                </Link>
                                            </Button>
                                            
                                            <Button size="icon" variant="outline" className="rounded-full h-12 w-12 md:h-14 md:w-14 border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/20 text-white hidden sm:flex">
                                                <Plus className="size-5 md:size-6" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}
