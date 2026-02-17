"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button";
import { Info, Play, Flame, Award } from "lucide-react";
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { getTrendingMovies, getMovieVideos, getBackdropUrl } from "@/lib/tmdb.client";
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
        Autoplay({ delay: 10000, stopOnInteraction: false })
    )
    const [movies, setMovies] = React.useState<MovieWithImages[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { setVideoId } = useVideoPlayer();

    React.useEffect(() => {
        async function fetchHeroMovies() {
            setIsLoading(true);
            try {
                const trendingMovies = await getTrendingMovies('day');
                if (!trendingMovies || trendingMovies.length === 0) {
                    setMovies([]);
                    return;
                }

                const topMovies = trendingMovies.slice(0, 12);

                const moviesDataPromises = topMovies.map(async (movie) => {
                    try {
                        const videos = await getMovieVideos(movie.id);
                        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
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
            <div className="relative w-full h-[calc(100vh-4.5rem)] bg-secondary/10">
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

    if (movies.length === 0) return null;

    return (
        <section className="relative w-full h-[calc(100vh-4.5rem)] bg-background overflow-hidden">
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
                <CarouselContent className="h-full ml-0">
                    {movies.map((movie) => (
                        <CarouselItem key={movie.id} className="h-[calc(100vh-4.5rem)] w-full pl-0 relative">
                            <div className="relative h-full w-full">
                                {movie.backdropUrl && (
                                    <Image
                                        src={movie.backdropUrl}
                                        alt={movie.title}
                                        fill
                                        className="object-cover object-center transition-opacity duration-1000 animate-in fade-in duration-[1500ms]"
                                        priority
                                        sizes="100vw"
                                        unoptimized
                                    />
                                )}
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent hidden lg:block" />
                                <div className="absolute inset-0 bg-black/40 lg:bg-black/10" />
                                
                                <div className="absolute bottom-[12%] md:bottom-[15%] left-0 w-full px-6 md:px-12 lg:px-24 max-w-7xl z-20 pointer-events-none">
                                    <div className="space-y-4 md:space-y-8 pointer-events-auto">
                                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-10 duration-700">
                                            <Badge className="bg-primary font-black uppercase text-[10px] md:text-xs px-3 py-1.5 rounded-sm shadow-xl shadow-primary/20 flex items-center gap-2">
                                                <Flame className="size-3.5 fill-current" /> Featured Selection
                                            </Badge>
                                            <Badge variant="outline" className="border-white/40 text-white font-black backdrop-blur-md text-[10px] md:text-xs uppercase tracking-[0.2em] px-3 py-1.5">
                                                Ultra HD 4K
                                            </Badge>
                                            <div className="flex items-center gap-2 text-white/90 font-black text-xs md:text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
                                                <Award className="size-4 text-yellow-400" />
                                                <span>{movie.vote_average.toFixed(1)} Rating</span>
                                            </div>
                                        </div>
                                        
                                        <h1 className="font-headline text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100 uppercase break-words max-w-5xl">
                                            {movie.title}
                                        </h1>
                                        
                                        <p className="text-sm md:text-xl lg:text-2xl text-white/95 line-clamp-2 md:line-clamp-3 max-w-3xl font-medium leading-relaxed drop-shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200 italic opacity-90">
                                            {movie.overview}
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-4 md:gap-6 pt-2 md:pt-6 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
                                            <button 
                                                className="bg-white text-black hover:bg-white/90 font-black rounded-full px-8 md:px-14 h-12 md:h-20 shadow-[0_20px_50px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95 text-xs md:text-xl flex items-center gap-4 group" 
                                                onClick={(e) => handlePlayTrailer(e, movie.trailerUrl)}
                                            >
                                                <div className="bg-black rounded-full p-2 group-hover:bg-primary transition-colors">
                                                    <Play className="size-4 md:size-6 text-white fill-current ml-0.5" />
                                                </div>
                                                Watch Trailer
                                            </button>
                                            
                                            <Link href={`/movie/${movie.id}`} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-3xl border border-white/10 font-bold rounded-full px-8 md:px-14 h-12 md:h-20 transition-all hover:scale-105 active:scale-95 text-xs md:text-xl flex items-center gap-4 shadow-2xl">
                                                <Info className="size-5 md:size-7 text-primary" /> More Info
                                            </Link>
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
