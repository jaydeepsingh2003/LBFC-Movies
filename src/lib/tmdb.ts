// src/lib/tmdb.ts

const TMDB_API_KEY = "2dc0bd12c7bd63b2c691d3a64f3a3db7";
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL_POSTER = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMAGE_BASE_URL_BACKDROP = 'https://image.tmdb.org/t/p/w1280';

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  backdrop_path: string | null;
  trailerUrl?: string;
  release_date: string;
  vote_average: number;
}

export interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  overview: string;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    credit_id: string;
}

export interface CrewMember {
    id: number;
    name: string;
    job: string;
    profile_path: string | null;
    credit_id: string;
}

export interface Review {
    author: string;
    content: string;
    id: string;
    author_details: {
        avatar_path: string | null;
        rating: number | null;
    };
}

export interface WatchProvider {
    logo_path: string;
    provider_id: number;
    provider_name: string;
}

export interface MovieDetails extends Movie {
    genres: { id: number; name: string }[];
    runtime: number;
    tagline: string;
    vote_average: number;
    credits: {
        cast: CastMember[];
        crew: CrewMember[];
    };
    videos: {
        results: TmdbVideo[];
    };
    reviews: {
        results: Review[];
    };
    'watch/providers': {
        results: {
            [countryCode: string]: {
                link: string;
                flatrate?: WatchProvider[];
                rent?: WatchProvider[];
                buy?: WatchProvider[];
            }
        }
    };
    similar: {
        results: Movie[];
    };
}

export interface TVShowDetails extends TVShow {
    genres: { id: number; name: string }[];
    number_of_seasons: number;
    number_of_episodes: number;
    tagline: string;
    credits: {
        cast: CastMember[];
        crew: CrewMember[];
    };
    videos: {
        results: TmdbVideo[];
    };
    'watch/providers': {
        results: {
            [countryCode: string]: {
                link: string;
                flatrate?: WatchProvider[];
            }
        }
    };
    similar: {
        results: TVShow[];
    };
    seasons: TVSeason[];
}

export interface TVSeason {
    id: number;
    name: string;
    overview: string;
    air_date: string;
    season_number: number;
    episode_count: number;
    poster_path: string | null;
}

export interface PersonDetails {
    id: number;
    name: string;
    biography: string;
    profile_path: string | null;
    birthday: string | null;
    deathday: string | null;
    place_of_birth: string | null;
    known_for_department: string;
    images: {
        profiles: { file_path: string }[];
    };
    movie_credits: {
        cast: (Movie & { credit_id: string })[];
        crew: (Movie & { credit_id: string })[];
    };
}


interface TmdbVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not set. API requests will be skipped.');
    return [];
  }

  const url = `${TMDB_API_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching from TMDB API:', error);
    return [];
  }
}

export async function getMovieVideos(movieId: number): Promise<TmdbVideo[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not set. API requests will be skipped.');
    return [];
  }

  const url = `${TMDB_API_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API request for videos failed with status ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching movie videos from TMDB API:', error);
    return [];
  }
}

export function getPosterUrl(path: string | null) {
  return path ? `${TMDB_IMAGE_BASE_URL_POSTER}${path}` : null;
}

export function getBackdropUrl(path: string | null) {
    return path ? `${TMDB_IMAGE_BASE_URL_BACKDROP}${path}` : null;
}
