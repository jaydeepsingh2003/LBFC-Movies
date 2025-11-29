import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MovieCard } from "./movie-card";

interface MovieCarouselProps {
  title: string;
  movies: {
    title: string;
    posterId: string;
  }[];
}

export function MovieCarousel({ title, movies }: MovieCarouselProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      {movies.length > 0 ? (
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {movies.map((movie, index) => (
              <CarouselItem key={index} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2">
                <MovieCard title={movie.title} posterId={movie.posterId} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-12 bg-background/50 hover:bg-background" />
          <CarouselNext className="mr-12 bg-background/50 hover:bg-background" />
        </Carousel>
      ) : (
        <p className="text-muted-foreground">No movies to display right now.</p>
      )}
    </div>
  );
}
