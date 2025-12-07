'use server';
/**
 * @fileOverview An advanced movie search AI agent that can find music videos.
 *
 * - advancedMovieSearch - A function that handles the advanced movie search process.
 * - AdvancedMovieSearchInput - The input type for the advancedMovieSearch function.
 * - AdvancedMovieSearchOutput - The return type for the advancedMovieSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

const AdvancedMovieSearchInputSchema = z.object({
  query: z.string().describe('The search query for movies or music videos.'),
});
export type AdvancedMovieSearchInput = z.infer<
  typeof AdvancedMovieSearchInputSchema
>;

const AdvancedMovieSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      videoId: z.string(),
      thumbnail: z.string(),
    })
  ),
});
export type AdvancedMovieSearchOutput = z.infer<
  typeof AdvancedMovieSearchOutputSchema
>;

const searchYoutube = ai.defineTool(
    {
        name: 'searchYoutube',
        description: 'Search for videos on YouTube',
        inputSchema: z.object({ query: z.string() }),
        outputSchema: AdvancedMovieSearchOutputSchema,
    },
    async ({ query }) => {
        if (!YOUTUBE_API_KEY) {
            throw new Error('YouTube API key is not configured.');
        }

        const url = `${YOUTUBE_API_URL}?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&type=video`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`YouTube API error: ${errorData.error.message}`);
            }
            const data = await response.json();
            
            return {
                results: data.items.map((item: any) => ({
                    title: item.snippet.title,
                    videoId: item.id.videoId,
                    thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
                })),
            };
        } catch (error) {
            console.error('Error searching YouTube:', error);
            return { results: [] };
        }
    }
);


export async function advancedMovieSearch(
  input: AdvancedMovieSearchInput
): Promise<AdvancedMovieSearchOutput> {
  return advancedMovieSearchFlow(input);
}

const advancedMovieSearchFlow = ai.defineFlow(
  {
    name: 'advancedMovieSearchFlow',
    inputSchema: AdvancedMovieSearchInputSchema,
    outputSchema: AdvancedMovieSearchOutputSchema,
  },
  async input => {
    return await searchYoutube(input);
  }
);
