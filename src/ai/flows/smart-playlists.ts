'use server';
/**
 * @fileOverview Creates dynamic playlists based on mood, genre, actors, or any combination thereof, automatically curated using AI.
 *
 * - generateSmartPlaylist - A function that generates a smart playlist based on the given criteria.
 * - SmartPlaylistInput - The input type for the generateSmartPlaylist function.
 * - SmartPlaylistOutput - The return type for the generateSmartPlaylist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartPlaylistInputSchema = z.object({
  mood: z.string().optional().describe('The mood for the playlist.'),
  genre: z.string().optional().describe('The genre for the playlist.'),
  actors: z.string().optional().describe('A comma-separated list of actors to include.'),
  directors: z.string().optional().describe('A comma-separated list of directors to include.'),
  description: z.string().optional().describe('Any additional description.'),
  playlistLength: z.number().min(5).max(20).default(10).describe('The desired number of movies in the playlist.'),
});
export type SmartPlaylistInput = z.infer<typeof SmartPlaylistInputSchema>;

const SmartPlaylistOutputSchema = z.object({
  playlistTitle: z.string().describe('The title of the playlist.'),
  movieTitles: z.array(z.string()).describe('An array of movie titles in the playlist.'),
  description: z.string().describe('A description of the playlist.'),
});
export type SmartPlaylistOutput = z.infer<typeof SmartPlaylistOutputSchema>;

export async function generateSmartPlaylist(input: SmartPlaylistInput): Promise<SmartPlaylistOutput> {
  return generateSmartPlaylistFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartPlaylistPrompt',
  input: {schema: SmartPlaylistInputSchema},
  output: {schema: SmartPlaylistOutputSchema},
  prompt: `You are an expert movie curator. Your task is to generate a smart movie playlist based on the user's preferences.

Here are the user's criteria:

{{#if mood}}Mood: {{{mood}}}{{/if}}
{{#if genre}}Genre: {{{genre}}}{{/if}}
{{#if actors}}Actors: {{{actors}}}{{/if}}
{{#if directors}}Directors: {{{directors}}}{{/if}}
{{#if description}}Description: {{{description}}}{{/if}}

Desired playlist length: {{{playlistLength}}} movies.

Based on these criteria, generate a playlist with a suitable title, a list of movie titles, and a short description of the playlist.

Output ONLY a JSON payload with the following structure:
{
  "playlistTitle": "The Playlist Title",
  "movieTitles": ["Movie Title 1", "Movie Title 2", ...],
  "description": "A short description of the playlist."
}
`,
});

const generateSmartPlaylistFlow = ai.defineFlow(
  {
    name: 'generateSmartPlaylistFlow',
    inputSchema: SmartPlaylistInputSchema,
    outputSchema: SmartPlaylistOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
