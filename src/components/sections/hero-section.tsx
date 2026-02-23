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
        Autoplay({ delay: 8000, stopOnInteraction: false })
    )
    const [movies, setMovies] = React.useState<MovieWithImages[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { setVideoId } = useVideoPlayer();

    React.useEffect(() => {
        async function fetchHeroMovies() {
            setIsLoading(true);
            try {
                const trendingMovies = await getTrendingMovies('day');
                if (!trendingMovies) return;

                const topMovies = trendingMovies.slice(0, 10);
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
                        return { ...movie, backdropUrl: movie.backdrop_path ? getBackdropUrl(movie.backdrop_path) : null };
                    }
                });

                const moviesData = (await Promise.all(moviesDataPromises))
                    .filter((movie): movie is MovieWithImages => !!movie.backdropUrl);

                setMovies(moviesData);
            } catch (error) { console.error(error); } finally { setIsLoading(false); }
        }
        fetchHeroMovies();
    }, []);

    const handlePlayTrailer = (e: React.MouseEvent, videoId: string | undefined) => {
        e.preventDefault();
        if (videoId) setVideoId(videoId);
    };

    if (isLoading) {
        return (
            <div className="relative w-full h-[85vh] bg-secondary/10">
                <Skeleton className="w-full h-full rounded-none" />
            </div>
        )
    }

    return (
        <section className="relative w-full h-[85vh] bg-background overflow-hidden">
            <Carousel
                plugins={[plugin.current]}
                className="w-full h-full"
                opts={{ loop: true, align: "start" }}
            >
                <CarouselContent className="h-full ml-0">
                    {movies.map((movie) => (
                        <CarouselItem key={movie.id} className="h-[85vh] w-full pl-0 relative">
                            <div className="relative h-full w-full overflow-hidden">
                                {movie.backdropUrl && (
                                    <Image src={movie.backdropUrl} alt={movie.title} fill className="object-cover" priority sizes="100vw" unoptimized />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent hidden lg:block" />
                                
                                <div className="absolute bottom-[10%] left-0 w-full px-6 md:px-12 lg:px-24 max-w-7xl z-20">
                                    <div className="space-y-6">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Badge className="bg-primary font-black uppercase text-[10px] px-3 py-1 rounded-sm shadow-xl flex items-center gap-2">
                                                <Flame className="size-3 fill-current" /> Trending Now
                                            </Badge>
                                            <div className="flex items-center gap-2 text-white/90 font-black text-xs bg-black/60 px-3 py-1 rounded-full border border-white/10">
                                                <Award className="size-4 text-yellow-400" />
                                                <span>{movie.vote_average.toFixed(1)} Critic Score</span>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <h2 className="font-headline text-lg md:text-2xl font-bold text-primary uppercase tracking-widest">
                                                Unlimited Movies. One Destination.
                                            </h2>
                                            <h1 className="font-headline text-4xl md:text-7xl font-black tracking-tighter text-white uppercase drop-shadow-2xl max-w-4xl">
                                                {movie.title}
                                            </h1>
                                        </div>
                                        
                                        <p className="text-base md:text-xl text-white/80 line-clamp-3 max-w-2xl font-medium leading-relaxed">
                                            Stream the latest and greatest films anytime, anywhere with CINEVEXIA. {movie.overview}
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-4 pt-4">
                                            <Button 
                                                size="lg"
                                                className="bg-primary hover:bg-primary/90 text-white font-black rounded-full px-10 h-14 md:h-16 shadow-2xl transition-all hover:scale-105 text-sm md:text-lg flex items-center gap-3" 
                                                onClick={(e) => handlePlayTrailer(e, movie.trailerUrl)}
                                            >
                                                <Play className="size-5 fill-current" /> Start Watching
                                            </Button>
                                            
                                            <Link href={`/movie/${movie.id}`}>
                                                <Button 
                                                    variant="outline"
                                                    size="lg"
                                                    className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border-white/10 font-bold rounded-full px-10 h-14 md:h-16 transition-all hover:scale-105 text-sm md:text-lg flex items-center gap-3"
                                                >
                                                    <Info className="size-5" /> More Info
                                                </Button>
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