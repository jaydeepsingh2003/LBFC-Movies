import { getPersonalizedRecommendations } from "@/ai/flows/personalized-recommendations-based-on-viewing-history";
import { MovieCarousel } from "../movie-carousel";
import { searchMovies, getPosterUrl, getMovieVideos } from "@/lib/tmdb";
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
        console.error("AI recommendations error:", error)
    }
    
    const moviePromises = recommendations.map(async (title) => {
        const searchResults = await searchMovies(title);
        const movie = searchResults.length > 0 ? searchResults[0] : null;
        if (movie) {
            const videos = await getMovieVideos(movie.id);
            const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
            movie.trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;
        }
        return movie;
    });
    
    const moviesData = (await Promise.all(moviePromises))
        .map((movie, index) => ({
            id: movie?.id,
            title: movie ? movie.title : recommendations[index],
            poster_path: movie?.poster_path || null,
            overview: movie?.overview || '',
            backdrop_path: movie?.backdrop_path || null,
            posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
            trailerUrl: movie?.trailerUrl,
        }));


    return <MovieCarousel title="For You" movies={moviesData} />;
}
