import { getRegionalAgeBasedTrendingMovies } from "@/ai/flows/regional-age-based-trending-movies";
import { MovieCarousel } from "../movie-carousel";
import { getPosterUrl, getMovieVideos, searchMovies } from "@/lib/tmdb";

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
    
    const moviePromises = trendingMovies.map(async (title) => {
        const searchResults = await searchMovies(title);
        const movie = searchResults.length > 0 ? searchResults[0] : null;
        if (movie) {
            const videos = await getMovieVideos(movie.id);
            const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
            movie.trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;
        }
        return movie;
    });

    const movies = (await Promise.all(moviePromises))
        .map((movie, index) => ({
            id: movie?.id,
            title: movie ? movie.title : trendingMovies[index],
            poster_path: movie?.poster_path || null,
            overview: movie?.overview || '',
            backdrop_path: movie?.backdrop_path || null,
            posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
            trailerUrl: movie?.trailerUrl,
        }));


    return <MovieCarousel title="Trending Now" movies={movies} />;
}
