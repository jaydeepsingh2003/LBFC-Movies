
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Info, PlayCircle } from "lucide-react";
import Image from 'next/image';

export default function HeroSection() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');

    return (
        <div className="relative h-[56.25vw] min-h-[300px] max-h-[80vh] w-full">
            {heroImage && (
                <Image
                    src={heroImage.imageUrl}
                    alt="Featured Movie"
                    fill
                    className="object-cover"
                    priority
                    data-ai-hint={heroImage.imageHint}
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
            
            <div className="absolute bottom-[20%] left-4 md:left-8 lg:left-16 max-w-lg">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-white drop-shadow-lg">
                    Movie of the Day
                </h1>
                <p className="mt-4 text-sm md:text-base text-white/90 drop-shadow-md line-clamp-3">
                    This is a captivating tale of adventure and discovery in a world beyond imagination. A must-watch for all sci-fi enthusiasts.
                </p>
                <div className="mt-6 flex gap-3">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                        <PlayCircle className="mr-2" /> Play
                    </Button>
                    <Button size="lg" variant="secondary" className="bg-white/30 hover:bg-white/20 text-white backdrop-blur-sm font-bold">
                        <Info className="mr-2" /> More Info
                    </Button>
                </div>
            </div>
        </div>
    );
}
