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
import { gsap } from 'gsap';

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
    const heroRef = React.useRef<HTMLDivElement>(null);

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

    React.useEffect(() => {
        if (!isLoading && movies.length > 0 && heroRef.current) {
            const ctx = gsap.context(() => {
                // High-Speed Entrance
                gsap.from('.hero-content-node', {
                    y: 60,
                    opacity: 0,
                    stagger: 0.1,
                    duration: 1,
                    ease: 'expo.out',
                    delay: 0.3
                });
                
                gsap.from('.hero-backdrop', {
                    scale: 1.15,
                    opacity: 0,
                    duration: 2,
                    ease: 'power2.out'
                });

                const handleHeroParallax = (e: MouseEvent) => {
                    const x = (e.clientX / window.innerWidth - 0.5) * 35;
                    const y = (e.clientY / window.innerHeight - 0.5) * 35;

                    gsap.to('.hero-backdrop', {
                        x: x * -0.4,
                        y: y * -0.4,
                        duration: 0.8,
                        ease: 'power3.out',
                        overwrite: 'auto'
                    });

                    gsap.to('.hero-text-plane', {
                        x: x * 0.6,
                        y: y * 0.6,
                        duration: 0.8,
                        ease: 'power3.out',
                        overwrite: 'auto'
                    });
                };

                const magneticButtons = document.querySelectorAll('.boss-magnetic');
                magneticButtons.forEach(btn => {
                    btn.addEventListener('mousemove', (e: any) => {
                        const rect = btn.getBoundingClientRect();
                        const x = e.clientX - rect.left - rect.width / 2;
                        const y = e.clientY - rect.top - rect.height / 2;
                        gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.25, ease: 'power3.out' });
                    });
                    btn.addEventListener('mouseleave', () => {
                        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
                    });
                });

                window.addEventListener('mousemove', handleHeroParallax, { passive: true });
                return () => window.removeEventListener('mousemove', handleHeroParallax);
            }, heroRef);
            return () => ctx.revert();
        }
    }, [isLoading, movies.length]);

    const handlePlayTrailer = (e: React.MouseEvent, videoId: string | undefined) => {
        e.preventDefault();
        if (videoId) setVideoId(videoId);
    };

    if (isLoading) {
        return (
            <div className="relative w-full h-[calc(100vh-4.5rem)] bg-secondary/10">
                <Skeleton className="w-full h-full rounded-none" />
            </div>
        )
    }

    return (
        <section ref={heroRef} className="relative w-full h-[calc(100vh-4.5rem)] bg-background overflow-hidden perspective-1000">
            <Carousel
                plugins={[plugin.current]}
                className="w-full h-full"
                opts={{ loop: true, align: "start" }}
            >
                <CarouselContent className="h-full ml-0">
                    {movies.map((movie) => (
                        <CarouselItem key={movie.id} className="h-[calc(100vh-4.5rem)] w-full pl-0 relative">
                            <div className="relative h-full w-full overflow-hidden preserve-3d">
                                {movie.backdropUrl && (
                                    <Image src={movie.backdropUrl} alt={movie.title} fill className="hero-backdrop object-cover scale-105 will-change-transform" priority sizes="100vw" unoptimized />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent hidden lg:block" />
                                
                                <div className="absolute bottom-[15%] left-0 w-full px-6 md:px-12 lg:px-24 max-w-7xl z-20 pointer-events-none">
                                    <div className="space-y-6 md:space-y-8 hero-text-plane pointer-events-auto">
                                        <div className="hero-content-node flex flex-wrap items-center gap-3">
                                            <Badge className="bg-primary font-black uppercase text-[10px] px-4 py-2 rounded-sm shadow-[0_0_25px_rgba(225,29,72,0.4)] flex items-center gap-2">
                                                <Flame className="size-3.5 fill-current" /> Studio Master
                                            </Badge>
                                            <div className="flex items-center gap-2 text-white/90 font-black text-xs bg-black/60 px-4 py-1.5 rounded-full border border-white/10">
                                                <Award className="size-4 text-yellow-400" />
                                                <span>{movie.vote_average.toFixed(1)} Studio Score</span>
                                            </div>
                                        </div>
                                        
                                        <h1 className="hero-content-node font-headline text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.85] drop-shadow-2xl uppercase max-w-5xl">
                                            {movie.title}
                                        </h1>
                                        
                                        <p className="hero-content-node text-base md:text-xl lg:text-2xl text-white/80 line-clamp-2 max-w-3xl font-medium leading-relaxed italic">
                                            {movie.overview}
                                        </p>
                                        
                                        <div className="hero-content-node flex flex-wrap gap-4 pt-6 md:pt-10">
                                            <button 
                                                className="boss-magnetic bg-white text-black hover:bg-white/90 font-black rounded-full px-10 md:px-14 h-14 md:h-20 shadow-xl transition-all hover:scale-105 text-sm md:text-xl flex items-center gap-4 group" 
                                                onClick={(e) => handlePlayTrailer(e, movie.trailerUrl)}
                                            >
                                                <div className="bg-black rounded-full p-2 md:p-3 group-hover:bg-primary transition-colors">
                                                    <Play className="size-4 md:size-6 text-white fill-current ml-0.5" />
                                                </div>
                                                Initialize Feed
                                            </button>
                                            
                                            <Link href={`/movie/${movie.id}`} className="boss-magnetic bg-white/10 hover:bg-white/20 text-white backdrop-blur-3xl border border-white/10 font-bold rounded-full px-10 md:px-14 h-14 md:h-20 transition-all hover:scale-105 text-sm md:text-xl flex items-center gap-4">
                                                <Info className="size-5 md:size-7 text-primary" /> Intelligence
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