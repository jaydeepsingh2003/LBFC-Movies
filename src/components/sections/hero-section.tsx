"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button";
import { Info, Play, Plus } from "lucide-react";
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
        Autoplay({ delay: 8000, stopOnInteraction: false })
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

                const topMovies = popularMovies.slice(0, 15);

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
        e.stopPropagation();
        if (videoId) {
            setVideoId(videoId);
        }
    };

    if (isLoading) {
        return (
            <div className="relative w-full h-svh bg-secondary/10">
                <Skeleton className="w-full h-full rounded-none" />
                <div className="absolute bottom-[20%] left-4 md:left-12 lg:left-24 max-w-2xl space-y-6 z-10">
                    <Skeleton className="h-12 md:h-24 w-3/4" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="flex gap-4 pt-6">
                        <Skeleton className="h-12 w-32 rounded-full" />
                        <Skeleton className="h-12 w-32 rounded-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (movies.length === 0) return null;

    return (
        <section className="relative w-full h-svh bg-background overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background z-0" />
            
            <Carousel
                plugins={[plugin.current]}
                className="w-full h-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                opts={{
                    loop: true,
                    align: "start",
                    skipSnaps: false,
                }}
            >
                <CarouselContent className="h-svh ml-0">
                    {movies.map((movie) => (
                        <CarouselItem key={movie.id} className="h-svh w-full pl-0 relative">
                            <div className="relative h-full w-full">
                                {movie.backdropUrl && (
                                    <Image
                                        src={movie.backdropUrl}
                                        alt={movie.title}
                                        fill
                                        className="object-cover object-center transition-opacity duration-1000 scale-105 animate-in fade-in zoom-in-105 duration-[2000ms]"
                                        priority
                                        sizes="100vw"
                                    />
                                )}
                                
                                {/* Complex Layered Gradients for Visibility */}
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent hidden lg:block" />
                                <div className="absolute inset-0 bg-black/60 lg:bg-black/10" />
                                
                                {/* Content Area */}
                                <div className="absolute bottom-[10%] md:bottom-[20%] left-0 w-full px-6 md:px-12 lg:px-24 max-w-5xl z-20">
                                    <div className="space-y-4 md:space-y-8">
                                        {/* Metadata Row */}
                                        <div className="flex items-center gap-2 md:gap-3 animate-in fade-in slide-in-from-left-10 duration-700">
                                            <Badge className="bg-primary font-black uppercase text-[8px] md:text-xs px-2 md:px-3 py-1 rounded-sm shadow-lg shadow-primary/20">Cinema Featured</Badge>
                                            <Badge variant="outline" className="border-white/40 text-white font-bold backdrop-blur-md text-[8px] md:text-xs uppercase tracking-widest">
                                                Ultra HD 4K
                                            </Badge>
                                            <div className="flex items-center gap-1 text-white/60 font-bold text-[10px] md:text-sm">
                                                <span>{new Date(movie.release_date).getFullYear()}</span>
                                                <span>•</span>
                                                <span className="text-primary">{movie.vote_average.toFixed(1)} Rating</span>
                                            </div>
                                        </div>
                                        
                                        {/* Fluid Title */}
                                        <h1 className="font-headline text-3xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.85] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100">
                                            {movie.title}
                                        </h1>
                                        
                                        {/* Adaptive Overview */}
                                        <p className="text-xs md:text-xl text-white/80 line-clamp-2 md:line-clamp-3 max-w-2xl font-medium leading-relaxed drop-shadow-xl animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                                            {movie.overview}
                                        </p>
                                        
                                        {/* Primary Actions */}
                                        <div className="flex flex-wrap gap-3 md:gap-5 pt-2 md:pt-6 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
                                            <Button 
                                                size="lg" 
                                                className="bg-white text-black hover:bg-white/90 font-black rounded-full px-6 md:px-12 h-12 md:h-16 shadow-2xl transition-all hover:scale-105 active:scale-95 text-xs md:text-lg" 
                                                onClick={(e) => handlePlayTrailer(e, movie.trailerUrl)}
                                            >
                                                <Play className="mr-2 md:mr-3 size-4 md:size-6 fill-current" /> Watch Trailer
                                            </Button>
                                            
                                            <Button 
                                                size="lg" 
                                                variant="secondary" 
                                                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-2xl border border-white/10 font-bold rounded-full px-6 md:px-12 h-12 md:h-16 transition-all hover:scale-105 active:scale-95 text-xs md:text-lg" 
                                                asChild
                                            >
                                                <Link href={`/movie/${movie.id}`}>
                                                    <Info className="mr-2 md:mr-3 size-4 md:size-6" /> More Info
                                                </Link>
                                            </Button>
                                            
                                            <Button size="icon" variant="outline" className="rounded-full h-12 w-12 md:h-16 md:w-16 border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/20 text-white hidden sm:flex transition-all">
                                                <Plus className="size-5 md:size-7" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
    );
}
