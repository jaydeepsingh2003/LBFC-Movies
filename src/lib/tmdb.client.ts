
'use client';

import { Movie, MovieDetails, Person, PersonDetails, TVShow, TVShowDetails, WatchProvider } from "./tmdb";

const TMDB_API_KEY = "2dc0bd12c7bd63b2c691d3a64f3a3db7";
const TMDB_IMAGE_BASE_URL_POSTER = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMAGE_BASE_URL_BACKDROP = 'https://image.tmdb.org/t/p/w1280';
const TMDB_IMAGE_BASE_URL_LOGO = 'https://image.tmdb.org/t/p/w200';

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

export async function searchTvShows(query: string): Promise<TVShow[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not available. API requests will be skipped.');
    return [];
  }

  const url = `/api/tmdb/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API request for TV shows failed with status ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching TV shows from TMDB API via proxy:', error);
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

export async function getTvShowVideos(tvId: number): Promise<TmdbVideo[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not set. API requests will be skipped.');
    return [];
  }

  const url = `/api/tmdb/3/tv/${tvId}/videos?api_key=${TMDB_API_KEY}&language=en-US`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API request for TV videos failed with status ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching TV show videos from TMDB API via proxy:', error);
    return [];
  }
}

export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not set.');
  }

  const url = `/api/tmdb/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,keywords,reviews,watch/providers,similar`;
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

export async function getTvShowDetails(tvId: number): Promise<TVShowDetails> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not set.');
  }

  const url = `/api/tmdb/3/tv/${tvId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,keywords,watch/providers,similar,external_ids`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API request failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV show details from TMDB API via proxy:', error);
    throw error;
  }
}

export async function getPersonDetails(personId: number): Promise<PersonDetails> {
    if (!TMDB_API_KEY) {
        throw new Error('TMDB_API_KEY is not set.');
    }

    const url = `/api/tmdb/3/person/${personId}?api_key=${TMDB_API_KEY}&append_to_response=movie_credits,images`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDB API request failed: ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching person details from TMDB API via proxy:', error);
        throw error;
    }
}

export async function getPopularPeople(): Promise<Person[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not available. API requests will be skipped.');
    return [];
  }
  const url = `/api/tmdb/3/person/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API request for popular people failed with status ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching popular people from TMDB API via proxy:', error);
    return [];
  }
}

export async function searchPeople(query: string): Promise<Person[]> {
    if (!TMDB_API_KEY) {
        console.error('TMDB_API_KEY is not available. API requests will be skipped.');
        return [];
    }
    const url = `/api/tmdb/3/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`TMDB API request for search people failed with status ${response.status}`);
            return [];
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching search people from TMDB API via proxy:', error);
        return [];
    }
}


export async function getNowPlayingMovies(): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not available. API requests will be skipped.');
    return [];
  }
  const url = `/api/tmdb/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
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

export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not available. API requests will be skipped.');
    return [];
  }
  const url = `/api/tmdb/3/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API request for trending movies failed with status ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching trending movies from TMDB API via proxy:', error);
    return [];
  }
}

export async function getPopularMovies(): Promise<Movie[]> {
    if (!TMDB_API_KEY) {
      console.error('TMDB_API_KEY is not available. API requests will be skipped.');
      return [];
    }
    const url = `/api/tmdb/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
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

export async function getUpcomingMovies(): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not available. API requests will be skipped.');
    return [];
  }
  const url = `/api/tmdb/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
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

async function fetchTvShowCategory(category: 'airing_today' | 'on_the_air' | 'popular' | 'top_rated'): Promise<TVShow[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not available. API requests will be skipped.');
    return [];
  }
  const url = `/api/tmdb/3/tv/${category}?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API request for TV shows failed with status ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Error fetching ${category} TV shows from TMDB API via proxy:`, error);
    return [];
  }
}

export const getAiringTodayTvShows = () => fetchTvShowCategory('airing_today');
export const getOnTheAirTvShows = () => fetchTvShowCategory('on_the_air');
export const getPopularTvShows = () => fetchTvShowCategory('popular');
export const getTopRatedTvShows = () => fetchTvShowCategory('top_rated');

export async function discoverTvShows(options: { 
  language?: string; 
  sortBy?: string;
  genreId?: number;
  voteAverageGte?: number;
  firstAirDateYear?: number;
  keywords?: string;
  with_watch_providers?: string;
  watch_region?: string;
}): Promise<TVShow[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not available. API requests will be skipped.');
    return [];
  }
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'en-US',
    page: '1',
    sort_by: options.sortBy || 'popularity.desc',
  });
  if (options.language) {
    params.append('with_original_language', options.language);
  }
  if (options.genreId) {
    params.append('with_genres', options.genreId.toString());
  }
  if (options.voteAverageGte) {
    params.append('vote_average.gte', options.voteAverageGte.toString());
  }
  if (options.firstAirDateYear) {
    params.append('first_air_date_year', options.firstAirDateYear.toString());
  }
  if (options.keywords) {
    params.append('with_keywords', options.keywords);
  }
  if (options.with_watch_providers) {
    params.append('with_watch_providers', options.with_watch_providers);
  }
  if (options.watch_region) {
    params.append('watch_region', options.watch_region);
  }

  const url = `/api/tmdb/3/discover/tv?${params.toString()}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API request for discover TV failed with status ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching discover TV shows from TMDB API via proxy:', error);
    return [];
  }
}

export async function discoverMovies(options: {
  genreId?: number;
  primaryReleaseYear?: number;
  voteAverageGte?: number;
  keywords?: string;
  with_watch_providers?: string;
  watch_region?: string;
}): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not available. API requests will be skipped.');
    return [];
  }

  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'en-US',
    page: '1',
    sort_by: 'popularity.desc',
    include_adult: 'false',
    include_video: 'false',
  });

  if (options.genreId) params.append('with_genres', options.genreId.toString());
  if (options.primaryReleaseYear) params.append('primary_release_year', options.primaryReleaseYear.toString());
  if (options.voteAverageGte) params.append('vote_average.gte', options.voteAverageGte.toString());
  if (options.keywords) params.append('with_keywords', options.keywords);
  if (options.with_watch_providers) {
    params.append('with_watch_providers', options.with_watch_providers);
  }
  if (options.watch_region) {
    params.append('watch_region', options.watch_region);
  }

  const url = `/api/tmdb/3/discover/movie?${params.toString()}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API request for discover movies failed with status ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching discover movies from TMDB API via proxy:', error);
    return [];
  }
}

export async function getWatchProviders(): Promise<WatchProvider[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not available. API requests will be skipped.');
    return [];
  }
  const url = `/api/tmdb/3/watch/providers/movie?api_key=${TMDB_API_KEY}&language=en-US&watch_region=IN`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API request for watch providers failed with status ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching watch providers from TMDB API via proxy:', error);
    return [];
  }
}

export function getPosterUrl(path: string | null) {
  return path ? `${TMDB_IMAGE_BASE_URL_POSTER}${path}` : null;
}

export function getBackdropUrl(path: string | null) {
  return path ? `${TMDB_IMAGE_BASE_URL_BACKDROP}${path}` : null;
}

export function getLogoUrl(path: string | null) {
    return path ? `${TMDB_IMAGE_BASE_URL_LOGO}${path}` : null;
}
