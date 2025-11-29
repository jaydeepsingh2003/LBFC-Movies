import { getPosterUrl, searchMovies } from "@/lib/tmdb";
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
        const searchPromises = franchiseMovies.map(title => searchMovies(title));
        const searchResults = await Promise.all(searchPromises);

        moviesData = searchResults.map((result, index) => {
            const movie = result.length > 0 ? result[0] : null;
            return {
                id: movie?.id,
                title: movie ? movie.title : franchiseMovies[index],
                posterUrl: movie ? getPosterUrl(movie.poster_path) : null,
                overview: movie?.overview || ''
            };
        });

    } catch (error) {
        console.error("Failed to fetch franchise movies:", error);
    }

    return <MovieCarousel title="Franchise Focus" movies={moviesData} />;
}
