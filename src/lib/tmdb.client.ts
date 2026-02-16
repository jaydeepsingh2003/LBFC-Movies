'use client';

import { Movie, MovieDetails, Person, PersonDetails, TVShow, TVShowDetails, WatchProvider } from "./tmdb";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
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
    console.error('TMDB_API_KEY is not available.');
    return [];
  }

  const url = `/api/tmdb/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
}

export async function searchTvShows(query: string): Promise<TVShow[]> {
  if (!TMDB_API_KEY) return [];
  const url = `/api/tmdb/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results;
  } catch (error) {
    return [];
  }
}

export async function getMovieVideos(movieId: number): Promise<TmdbVideo[]> {
    if (!TMDB_API_KEY) return [];
    const url = `/api/tmdb/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      return [];
    }
  }

export async function getTvShowVideos(tvId: number): Promise<TmdbVideo[]> {
  if (!TMDB_API_KEY) return [];
  const url = `/api/tmdb/3/tv/${tvId}/videos?api_key=${TMDB_API_KEY}&language=en-US`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    return [];
  }
}

export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  const url = `/api/tmdb/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,keywords,reviews,watch/providers,similar`;
  const response = await fetch(url);
  return response.json();
}

export async function getTvShowDetails(tvId: number): Promise<TVShowDetails> {
  const url = `/api/tmdb/3/tv/${tvId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,keywords,watch/providers,similar,external_ids`;
  const response = await fetch(url);
  return response.json();
}

export async function getPersonDetails(personId: number): Promise<PersonDetails> {
    const url = `/api/tmdb/3/person/${personId}?api_key=${TMDB_API_KEY}&append_to_response=movie_credits,images`;
    const response = await fetch(url);
    return response.json();
}

export async function getPopularPeople(): Promise<Person[]> {
  if (!TMDB_API_KEY) return [];
  const url = `/api/tmdb/3/person/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
}

export async function searchPeople(query: string): Promise<Person[]> {
    if (!TMDB_API_KEY) return [];
    const url = `/api/tmdb/3/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
}

export async function getNowPlayingMovies(language: string = 'en-US', region?: string): Promise<Movie[]> {
  if (!TMDB_API_KEY) return [];
  let url = `/api/tmdb/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=${language}&page=1`;
  if (region) url += `&region=${region}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
}

export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> {
  if (!TMDB_API_KEY) return [];
  const url = `/api/tmdb/3/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
}

export async function getPopularMovies(): Promise<Movie[]> {
    if (!TMDB_API_KEY) return [];
    const url = `/api/tmdb/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
}

export async function getUpcomingMovies(language: string = 'en-US'): Promise<Movie[]> {
  if (!TMDB_API_KEY) return [];
  const url = `/api/tmdb/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=${language}&page=1`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
}

async function fetchTvShowCategory(category: 'airing_today' | 'on_the_air' | 'popular' | 'top_rated'): Promise<TVShow[]> {
  if (!TMDB_API_KEY) return [];
  const url = `/api/tmdb/3/tv/${category}?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
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
  with_original_language?: string;
}, totalPages: number = 1): Promise<TVShow[]> {
  if (!TMDB_API_KEY) return [];
  
  let allTvShows: TVShow[] = [];
  
  for (let page = 1; page <= totalPages; page++) {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: 'en-US',
      page: page.toString(),
      sort_by: options.sortBy || 'popularity.desc',
    });
    if (options.with_original_language) params.append('with_original_language', options.with_original_language);
    if (options.genreId) params.append('with_genres', options.genreId.toString());
    if (options.voteAverageGte) params.append('vote_average.gte', options.voteAverageGte.toString());
    if (options.firstAirDateYear) params.append('first_air_date_year', options.firstAirDateYear.toString());
    if (options.keywords) params.append('with_keywords', options.keywords);
    if (options.with_watch_providers) params.append('with_watch_providers', options.with_watch_providers);
    if (options.watch_region) params.append('watch_region', options.watch_region);
  
    const url = `/api/tmdb/3/discover/tv?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) break;
    const data = await response.json();
    allTvShows = allTvShows.concat(data.results);
  }
  return allTvShows;
}

export async function discoverMovies(options: {
  genreId?: number;
  primaryReleaseYear?: number;
  voteAverageGte?: number;
  keywords?: string;
  with_watch_providers?: string;
  watch_region?: string;
  with_original_language?: string;
  sort_by?: string;
}, totalPages: number = 1): Promise<Movie[]> {
  if (!TMDB_API_KEY) return [];

  let allMovies: Movie[] = [];

  for (let page = 1; page <= totalPages; page++) {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: 'en-US',
      page: page.toString(),
      sort_by: options.sort_by || 'popularity.desc',
      include_adult: 'false',
      include_video: 'false',
    });

    if (options.genreId) params.append('with_genres', options.genreId.toString());
    if (options.primaryReleaseYear) params.append('primary_release_year', options.primaryReleaseYear.toString());
    if (options.voteAverageGte) params.append('vote_average.gte', options.voteAverageGte.toString());
    if (options.keywords) params.append('with_keywords', options.keywords);
    if (options.with_watch_providers) params.append('with_watch_providers', options.with_watch_providers);
    if (options.watch_region) params.append('watch_region', options.watch_region);
    if (options.with_original_language) params.append('with_original_language', options.with_original_language);

    const url = `/api/tmdb/3/discover/movie?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) break;
    const data = await response.json();
    allMovies = allMovies.concat(data.results);
  }
  return allMovies;
}

export async function getWatchProviders(): Promise<WatchProvider[]> {
  if (!TMDB_API_KEY) return [];
  const url = `/api/tmdb/3/watch/providers/movie?api_key=${TMDB_API_KEY}&language=en-US&watch_region=IN`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
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
