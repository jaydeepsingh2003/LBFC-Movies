import { getRegionalAgeBasedTrendingMovies } from "@/ai/flows/regional-age-based-trending-movies";
import { MovieCarousel } from "../movie-carousel";

export default async function TrendingSection() {
    let trendingMovies: string[] = [];
    try {
        const result = await getRegionalAgeBasedTrendingMovies({
            region: "United States",
            ageGroup: "25-34",
        });
        trendingMovies = result.trendingMovies;
    } catch (error) {
        console.error("Failed to get trending movies:", error);
    }
    
    const movies = trendingMovies.map((title, index) => ({
        title,
        posterId: `movie-poster-${(index % 10) + 1}`,
    }));

    return <MovieCarousel title="Trending Now" movies={movies} />;
}
