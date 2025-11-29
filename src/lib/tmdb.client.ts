'use client';

import { Movie, MovieDetails } from "./tmdb";

const TMDB_API_KEY = "2dc0bd12c7bd63b2c691d3a64f3a3db7";
const TMDB_IMAGE_BASE_URL_POSTER = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMAGE_BASE_URL_BACKDROP = 'https://image.tmdb.org/t/p/w1280';

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

export async function getMovieVideos(movieId: number): Promise<TmdbVideo[]> {
    if (!TMDB_API_KEY) {
      console.error('TMDB_API_KEY is not set. API requests will be skipped.');
      return [];
    }
  
    const url = `/api/tmdb/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`TMDB API request for videos failed with status ${response.status}`);
        return [];
      }
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching movie videos from TMDB API via proxy:', error);
      return [];
    }
  }

export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not set.');
  }

  const url = `/api/tmdb/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,keywords,reviews`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API request failed: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching movie details from TMDB API via proxy:', error);
    throw error;
  }
}

export function getPosterUrl(path: string | null) {
  return path ? `${TMDB_IMAGE_BASE_URL_POSTER}${path}` : null;
}

export function getBackdropUrl(path: string | null) {
  return path ? `${TMDB_IMAGE_BASE_URL_BACKDROP}${path}` : null;
}
