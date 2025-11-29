// src/lib/tmdb.client.ts
'use client';

import { Movie } from "./tmdb";

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';


export async function searchMovies(query: string): Promise<Movie[]> {
  // This is a client-side file, we read the public env var from next.config.js
  const TMDB_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

  if (!TMDB_ACCESS_TOKEN) {
    console.error('TMDB_ACCESS_TOKEN is not available in the client. API requests will be skipped.');
    return [];
  }

  const url = `${TMDB_API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
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
