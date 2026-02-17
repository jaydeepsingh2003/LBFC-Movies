
'use client';

import { useState, useEffect } from "react";
import { discoverMovies, getPosterUrl } from "@/lib/tmdb.client";
import { Movie } from "@/lib/tmdb";
import { Skeleton } from "../ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { MovieCard } from "../movie-card";
import { MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const REGIONS = [
    { label: 'India', code: 'IN' },
    { label: 'USA', code: 'US' },
    { label: 'UK', code: 'GB' },
    { label: 'South Korea', code: 'KR' },
    { label: 'Japan', code: 'JP' },
    { label: 'Spain', code: 'ES' },
];

export default function RegionalTop10Section() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeRegion, setActiveRegion] = useState(REGIONS[0].code);

    useEffect(() => {
        const fetchRegionalTop10 = async () => {
            setIsLoading(true);
            try {
                // Using with_origin_country ensures we see ACTUAL regional cinema (e.g. Indian movies for India)
                const results = await discoverMovies({ 
                    with_origin_country: activeRegion, 
                    sort_by: 'popularity.desc' 
                });
                setMovies(results.slice(0, 10));
            } catch (error) {
                console.error(`Failed to fetch top 10 movies for region ${activeRegion}:`, error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchRegionalTop10();
    }, [activeRegion]);

    const activeRegionLabel = REGIONS.find(r => r.code === activeRegion)?.label;

    return (
        <section className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <MapPin className="text-blue-500 size-6 md:size-8" />
                    </div>
                    <div>
                        <h2 className="font-headline text-2xl md:text-4xl font-black tracking-tighter uppercase text-white">
                            Top 10 in <span className="text-blue-500">{activeRegionLabel}</span>
                        </h2>
                        <p className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-widest">Trending titles from this region</p>
                    </div>
                </div>

                <Tabs value={activeRegion} onValueChange={setActiveRegion} className="w-full md:w-auto">
                    <TabsList className="bg-secondary/40 p-1 rounded-xl h-12 overflow-x-auto no-scrollbar w-full md:w-auto">
                        {REGIONS.map((region) => (
                            <TabsTrigger 
                                key={region.code} 
                                value={region.code}
                                className="rounded-lg px-4 font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] md:text-xs uppercase tracking-widest"
                            >
                                {region.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <div className="min-h-[350px]">
                {isLoading ? (
                    <div className="flex gap-6 overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="aspect-[2/3] w-64 flex-shrink-0 rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <Carousel opts={{ align: 'start', loop: false, dragFree: true }} className="w-full">
                        <CarouselContent className="-ml-4 md:-ml-8">
                            {movies.map((movie, index) => (
                                <CarouselItem key={movie.id} className="basis-[75%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-4 md:pl-8">
                                    <div className="relative group">
                                        <div className="absolute -left-4 md:-left-8 bottom-0 z-0 select-none pointer-events-none">
                                            <span className="text-[120px] md:text-[200px] font-black leading-none text-transparent" 
                                                  style={{ WebkitTextStroke: '2px rgba(255,255,255,0.15)' }}>
                                                {index + 1}
                                            </span>
                                        </div>
                                        
                                        <div className="relative z-10 pl-10 md:pl-16 transform transition-all duration-500 group-hover:-translate-y-3 group-hover:scale-[1.02]">
                                            <MovieCard 
                                                id={movie.id} 
                                                title={movie.title} 
                                                posterUrl={getPosterUrl(movie.poster_path)}
                                                overview={movie.overview}
                                                poster_path={movie.poster_path}
                                            />
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex -left-12 h-12 w-12 glass-panel border-none hover:bg-primary shadow-2xl" />
                        <CarouselNext className="hidden md:flex -right-12 h-12 w-12 glass-panel border-none hover:bg-primary shadow-2xl" />
                    </Carousel>
                )}
            </div>
        </section>
    );
}
