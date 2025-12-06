'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/user-profile-creation.ts';
import '@/ai/flows/favorite-artists-directors.ts';
import '@/ai/flows/ai-powered-movie-search.ts';
import '@/ai/flows/ai-chatbot.ts';
import '@/ai/flows/regional-age-based-trending-movies.ts';
import '@/ai/flows/mood-based-recommendations.ts';
import '@/ai/flows/smart-playlists.ts';
import '@/ai/flows/language-based-movie-picks.ts';
import '@/ai/flows/personalized-recommendations-based-on-viewing-history.ts';
import '@/ai/flows/advanced-movie-search.ts';
import '@/ai/flows/movie-timeline.ts';
import '@/ai/flows/movie-matchmaker.ts';
import '@/ai/flows/movie-trivia.ts';
import '@/ai/flows/get-external-ratings.ts';
import '@/ai/flows/get-external-tv-ratings.ts';
