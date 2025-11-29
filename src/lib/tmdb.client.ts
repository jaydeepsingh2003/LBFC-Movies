'use client';

import { Movie } from "./tmdb";

const TMDB_API_KEY = "2dc0bd12c7bd63b2c691d3a64f3a3db7";
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';


export async function searchMovies(query: string): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not available. API requests will be skipped.');
    return [];
  }

  const url = `/api/tmdb/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching from TMDB API via proxy:', error);
    return [];
  }
}

export function getPosterUrl(path: string | null) {
  return path ? `${TMDB_IMAGE_BASE_URL}${path}` : null;
}
