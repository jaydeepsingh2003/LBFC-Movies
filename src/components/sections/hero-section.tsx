
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
        Autoplay({ delay: 10000, stopOnInteraction: false })
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

    // Boss-Level Parallax & Magnetic System
    React.useEffect(() => {
        if (!isLoading && movies.length > 0 && heroRef.current) {
            const ctx = gsap.context(() => {
                // Entrance Sequence
                gsap.from('.hero-content-node', {
                    y: 80,
                    opacity: 0,
                    stagger: 0.15,
                    duration: 1.4,
                    ease: 'expo.out',
                    delay: 0.4
                });
                
                gsap.from('.hero-backdrop', {
                    scale: 1.2,
                    opacity: 0,
                    duration: 2.5,
                    ease: 'power2.out'
                });

                // Mouse-driven 3D Parallax
                const handleHeroParallax = (e: MouseEvent) => {
                    const x = (e.clientX / window.innerWidth - 0.5) * 40;
                    const y = (e.clientY / window.innerHeight - 0.5) * 40;

                    gsap.to('.hero-backdrop', {
                        x: x * -0.5,
                        y: y * -0.5,
                        scale: 1.05,
                        duration: 1,
                        ease: 'power2.out'
                    });

                    gsap.to('.hero-text-plane', {
                        x: x * 0.8,
                        y: y * 0.8,
                        duration: 1,
                        ease: 'power2.out'
                    });
                };

                // Magnetic Buttons
                const magneticButtons = document.querySelectorAll('.boss-magnetic');
                magneticButtons.forEach(btn => {
                    btn.addEventListener('mousemove', (e: any) => {
                        const rect = btn.getBoundingClientRect();
                        const x = e.clientX - rect.left - rect.width / 2;
                        const y = e.clientY - rect.top - rect.height / 2;
                        gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.3, ease: 'power2.out' });
                    });
                    btn.addEventListener('mouseleave', () => {
                        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
                    });
                });

                window.addEventListener('mousemove', handleHeroParallax);
                return () => window.removeEventListener('mousemove', handleHeroParallax);
            }, heroRef);
            return () => ctx.revert();
        }
    }, [isLoading, movies.length]);

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
        <section ref={heroRef} className="relative w-full h-[calc(100vh-4.5rem)] bg-background overflow-hidden perspective-1000">
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
                            <div className="relative h-full w-full overflow-hidden preserve-3d">
                                {movie.backdropUrl && (
                                    <Image
                                        src={movie.backdropUrl}
                                        alt={movie.title}
                                        fill
                                        className="hero-backdrop object-cover object-center transition-opacity duration-1000 scale-105"
                                        priority
                                        sizes="100vw"
                                        unoptimized
                                    />
                                )}
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-transparent to-transparent hidden lg:block" />
                                <div className="absolute inset-0 bg-black/20" />
                                
                                <div className="absolute bottom-[15%] md:bottom-[18%] left-0 w-full px-6 md:px-12 lg:px-24 max-w-7xl z-20 pointer-events-none">
                                    <div className="space-y-6 md:space-y-10 hero-text-plane pointer-events-auto">
                                        <div className="hero-content-node flex flex-wrap items-center gap-3">
                                            <Badge className="bg-primary font-black uppercase text-[10px] md:text-xs px-4 py-2 rounded-sm shadow-[0_0_30px_rgba(225,29,72,0.5)] flex items-center gap-2">
                                                <Flame className="size-4 fill-current" /> Studio Choice
                                            </Badge>
                                            <Badge variant="outline" className="border-white/20 text-white font-black backdrop-blur-3xl text-[10px] md:text-xs uppercase tracking-[0.3em] px-4 py-2">
                                                IMAX Experience
                                            </Badge>
                                            <div className="flex items-center gap-2 text-white/90 font-black text-xs md:text-sm bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl">
                                                <Award className="size-4 text-yellow-400" />
                                                <span>{movie.vote_average.toFixed(1)} Index</span>
                                            </div>
                                        </div>
                                        
                                        <h1 className="hero-content-node font-headline text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.85] drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] uppercase break-words max-w-6xl">
                                            {movie.title}
                                        </h1>
                                        
                                        <p className="hero-content-node text-base md:text-2xl lg:text-3xl text-white/90 line-clamp-2 md:line-clamp-3 max-w-4xl font-medium leading-relaxed drop-shadow-2xl italic opacity-95">
                                            {movie.overview}
                                        </p>
                                        
                                        <div className="hero-content-node flex flex-wrap gap-4 md:gap-8 pt-4 md:pt-10">
                                            <button 
                                                className="boss-magnetic bg-white text-black hover:bg-white/90 font-black rounded-full px-10 md:px-16 h-14 md:h-24 shadow-[0_30px_60px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95 text-sm md:text-2xl flex items-center gap-5 group overflow-hidden relative" 
                                                onClick={(e) => handlePlayTrailer(e, movie.trailerUrl)}
                                            >
                                                <div className="bg-black rounded-full p-2.5 md:p-4 group-hover:bg-primary transition-colors">
                                                    <Play className="size-5 md:size-8 text-white fill-current ml-1" />
                                                </div>
                                                Watch Feed
                                            </button>
                                            
                                            <Link href={`/movie/${movie.id}`} className="boss-magnetic bg-white/10 hover:bg-white/20 text-white backdrop-blur-3xl border border-white/10 font-bold rounded-full px-10 md:px-16 h-14 md:h-24 transition-all hover:scale-105 active:scale-95 text-sm md:text-2xl flex items-center gap-5 shadow-2xl">
                                                <Info className="size-6 md:size-9 text-primary" /> Intelligence
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
