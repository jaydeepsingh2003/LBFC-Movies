// src/lib/tmdb.client.ts
'use client';

import { Movie } from "./tmdb";

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';


export async function searchMovies(query: string): Promise<Movie[]> {
  // Note: This is a client-side file, so we can't access process.env here.
  // We would typically fetch the API key from a server endpoint or have it available in the client environment.
  // For this implementation, we will assume there is a way to get the access token, maybe from a context or a dedicated endpoint.
  // Since we don't have that setup, and to avoid exposing keys, we'll return an empty array if no token is found.
  // A real app would need a secure way to handle this.
  
  const TMDB_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN; // This needs to be configured in next.config.js and .env.local

  if (!TMDB_ACCESS_TOKEN) {
    console.error('TMDB_ACCESS_TOKEN is not available in the client. API requests will be skipped.');
    // To make this work without exposing the key, we'd need a backend endpoint to proxy the TMDB API.
    // For now, we will return an empty array.
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
