import { languageBasedMoviePicks } from "@/ai/flows/language-based-movie-picks";
import { MovieCarousel } from "../movie-carousel";
import { searchMovies, getPosterUrl, getMovieVideos } from "@/lib/tmdb";
import { Movie } from "@/lib/tmdb";

export default async function TamilMoviesSection() {
    let recommendations: string[] = [];
    try {
        const result = await languageBasedMoviePicks({ languages: ["Tamil"], numberOfRecommendations: 15 });
        recommendations = result.movieRecommendations;
    } catch (error) {
        console.error("AI recommendations error for Tamil movies:", error)
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

    const resolvedMovies = (await Promise.all(moviePromises)).filter((movie): movie is Movie => movie !== null);

    const uniqueMovies = resolvedMovies.reduce((acc: Movie[], current) => {
        if (!acc.find(item => item.id === current.id)) {
            acc.push(current);
        }
        return acc;
    }, []);

    const moviesData = uniqueMovies.map(movie => ({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || null,
        overview: movie.overview || '',
        backdrop_path: movie.backdrop_path || null,
        posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
        trailerUrl: movie.trailerUrl,
    }));

    return <MovieCarousel title="Popular in Tamil" movies={moviesData} />;
}
