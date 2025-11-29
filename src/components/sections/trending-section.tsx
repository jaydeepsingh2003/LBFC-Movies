import { getRegionalAgeBasedTrendingMovies } from "@/ai/flows/regional-age-based-trending-movies";
import { MovieCarousel } from "../movie-carousel";
import { getPosterUrl, searchMovies } from "@/lib/tmdb";

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
    
    const moviePromises = trendingMovies.map(title => searchMovies(title));
    const searchResults = await Promise.all(moviePromises);

    const movies = searchResults.map((result, index) => {
        const movie = result.length > 0 ? result[0] : null;
        return {
            title: movie ? movie.title : trendingMovies[index],
            posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
        }
    });

    return <MovieCarousel title="Trending Now" movies={movies} />;
}
