import { getPersonalizedRecommendations } from "@/ai/flows/personalized-recommendations-based-on-viewing-history";
import { MovieCarousel } from "../movie-carousel";

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
        const result = await getPersonalizedRecommendations({ viewingHistory });
        recommendations = result.recommendations;
    } catch (error) {
        // We will log the error to the server console for debugging
        // but prevent it from crashing the client.
    }
    
    const movies = recommendations.map((title, index) => ({
        title,
        posterId: `movie-poster-${(index % 10) + 1}`,
    }));

    return <MovieCarousel title="For You" movies={movies} />;
}
