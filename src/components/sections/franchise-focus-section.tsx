import { getMovieVideos, getPosterUrl, searchMovies } from "@/lib/tmdb";
import { MovieCarousel } from "../movie-carousel";

export default async function FranchiseFocusSection() {
    const franchiseMovies = [
        "Mission: Impossible - Fallout",
        "John Wick: Chapter 4",
        "Mission: Impossible - Ghost Protocol",
        "John Wick: Chapter 3 - Parabellum",
        "Mission: Impossible - Rogue Nation",
        "John Wick: Chapter 2",
    ];

    let moviesData = [];
    try {
        const searchPromises = franchiseMovies.map(async (title) => {
            const searchResults = await searchMovies(title);
            const movie = searchResults.length > 0 ? searchResults[0] : null;
            if (movie) {
                const videos = await getMovieVideos(movie.id);
                const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
                movie.trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;
            }
            return movie;
        });

        const resolvedMovies = await Promise.all(searchPromises);

        moviesData = resolvedMovies.map((movie, index) => {
            return {
                id: movie?.id,
                title: movie ? movie.title : franchiseMovies[index],
                posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
                overview: movie?.overview || '',
                trailerUrl: movie?.trailerUrl,
            };
        });

    } catch (error) {
        console.error("Failed to fetch franchise movies:", error);
    }

    return <MovieCarousel title="Franchise Focus" movies={moviesData} />;
}
