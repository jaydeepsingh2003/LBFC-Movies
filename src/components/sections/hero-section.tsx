
"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Info, PlayCircle } from "lucide-react";
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"

const heroMovies = [
    {
        id: 'hero-1',
        title: 'Movie of the Day',
        description: 'This is a captivating tale of adventure and discovery in a world beyond imagination. A must-watch for all sci-fi enthusiasts.',
    },
    {
        id: 'hero-2',
        title: 'Action Packed Thriller',
        description: 'An edge-of-your-seat thriller that will keep you guessing until the very end. Full of twists and turns.',
    },
    {
        id: 'hero-3',
        title: 'Heartwarming Drama',
        description: 'A beautiful story about family, loss, and the power of hope. Prepare to be moved.',
    }
]

export default function HeroSection() {
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    )

    return (
        <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselContent>
                {heroMovies.map((movie) => {
                    const heroImage = PlaceHolderImages.find(p => p.id === movie.id);
                    return (
                        <CarouselItem key={movie.id}>
                            <div className="relative h-[56.25vw] min-h-[300px] max-h-[80vh] w-full">
                                {heroImage && (
                                    <Image
                                        src={heroImage.imageUrl}
                                        alt={movie.title}
                                        fill
                                        className="object-cover"
                                        priority
                                        data-ai-hint={heroImage.imageHint}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
                                
                                <div className="absolute bottom-[20%] left-4 md:left-8 lg:left-16 max-w-lg">
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-white drop-shadow-lg animate-in fade-in slide-in-from-bottom-10 duration-700">
                                        {movie.title}
                                    </h1>
                                    <p className="mt-4 text-sm md:text-base text-white/90 drop-shadow-md line-clamp-3 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
                                        {movie.description}
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
