'use server';
/**
 * @fileOverview An advanced movie search AI agent that can find music videos.
 * 
 * Includes a premium fallback mechanism for prototype environments where
 * the YouTube API key might be missing.
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

// Premium Fallback Data for consistent look during trial/setup
const FALLBACK_RESULTS = [
    { title: "The Weeknd - Blinding Lights (Official Video)", videoId: "4NRXx6U8ABQ", thumbnail: "https://img.youtube.com/vi/4NRXx6U8ABQ/maxresdefault.jpg" },
    { title: "Taylor Swift - Anti-Hero (Official Music Video)", videoId: "b1kbLwvqugk", thumbnail: "https://img.youtube.com/vi/b1kbLwvqugk/maxresdefault.jpg" },
    { title: "Harry Styles - As It Was (Official Video)", videoId: "H5v3kku4y6Q", thumbnail: "https://img.youtube.com/vi/H5v3kku4y6Q/maxresdefault.jpg" },
    { title: "Dua Lipa - Levitating (Official Music Video)", videoId: "TUVcZfQe-Kw", thumbnail: "https://img.youtube.com/vi/TUVcZfQe-Kw/maxresdefault.jpg" },
    { title: "Interstellar Main Theme - Hans Zimmer (Live)", videoId: "4y33h81phKU", thumbnail: "https://img.youtube.com/vi/4y33h81phKU/maxresdefault.jpg" },
    { title: "The Batman - Something in the Way (Nirvana)", videoId: "uY3LAFJbKyY", thumbnail: "https://img.youtube.com/vi/uY3LAFJbKyY/maxresdefault.jpg" },
    { title: "Spider-Man: Across the Spider-Verse - Am I Dreaming", videoId: "6_uYXD_YTo0", thumbnail: "https://img.youtube.com/vi/6_uYXD_YTo0/maxresdefault.jpg" },
    { title: "Oppenheimer - Can You Hear The Music (Ludwig Göransson)", videoId: "4JZ-WXP3Sws", thumbnail: "https://img.youtube.com/vi/4JZ-WXP3Sws/maxresdefault.jpg" },
];

const searchYoutube = ai.defineTool(
    {
        name: 'searchYoutube',
        description: 'Search for videos on YouTube',
        inputSchema: z.object({ query: z.string() }),
        outputSchema: AdvancedMovieSearchOutputSchema,
    },
    async ({ query }) => {
        if (!YOUTUBE_API_KEY) {
            // Return fallback results if no API key is provided so the UI isn't empty
            return { results: FALLBACK_RESULTS };
        }

        const url = `${YOUTUBE_API_URL}?part=snippet&maxResults=24&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&type=video`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                console.warn(`YouTube API error: ${errorData.error?.message || 'Unknown error'}`);
                return { results: FALLBACK_RESULTS };
            }
            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                return { results: FALLBACK_RESULTS };
            }

            return {
                results: data.items.map((item: any) => ({
                    title: item.snippet.title,
                    videoId: item.id.videoId,
                    thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.standard?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
                })),
            };
        } catch (error) {
            console.error('Error searching YouTube:', error);
            return { results: FALLBACK_RESULTS };
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
