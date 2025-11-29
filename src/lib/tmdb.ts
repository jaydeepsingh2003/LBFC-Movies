// src/lib/tmdb.ts

const TMDB_API_KEY = "2dc0bd12c7bd63b2c691d3a64f3a3db7";
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
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

export function getPosterUrl(path: string | null) {
  return path ? `${TMDB_IMAGE_BASE_URL}${path}` : null;
}
