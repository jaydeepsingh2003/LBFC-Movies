import { getPersonalizedRecommendations } from "@/ai/flows/personalized-recommendations-based-on-viewing-history";
import { MovieCarousel } from "../movie-carousel";
import { searchMovies, getPosterUrl } from "@/lib/tmdb";
import { Movie } from "@/lib/tmdb";

export default async function ForYouSection() {
    const viewingHistory = [
        "Inception",
        "The Matrix",
        "Parasite",
        "The Godfather",
        "Pulp Fiction",
    ];

    let recommendations: string[] = [];
    try {
        const result = await getPersonalizedRecommendations({ viewingHistory, numberOfRecommendations: 10 });
        recommendations = result.recommendations;
    } catch (error) {
        // We will log the error to the server console for debugging
        // but prevent it from crashing the client.
    }
    
    const moviePromises = recommendations.map(title => searchMovies(title));
    const searchResults = await Promise.all(moviePromises);
    
    const moviesData = searchResults.map((result, index) => {
        const movie = result.length > 0 ? result[0] : null;
        return {
            title: movie ? movie.title : recommendations[index],
            posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
        }
    });

    return <MovieCarousel title="For You" movies={moviesData} />;
}
