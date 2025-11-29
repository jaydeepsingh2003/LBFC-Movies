'use server';
/**
 * @fileOverview Provides iconic movie recommendations for a specific year.
 *
 * - getMovieTimeline - A function to get iconic movies for a timeline.
 * - MovieTimelineInput - The input type for the getMovieTimeline function.
 * - MovieTimelineOutput - The return type for the getMovieTimeline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MovieTimelineInputSchema = z.object({
  year: z.number().describe('The target year for movie recommendations.'),
  numberOfRecommendations: z.number().optional().default(15).describe('Number of movies to recommend.'),
});
export type MovieTimelineInput = z.infer<typeof MovieTimelineInputSchema>;

const MovieTimelineOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('List of iconic movies from the specified year.'),
});
export type MovieTimelineOutput = z.infer<typeof MovieTimelineOutputSchema>;

export async function getMovieTimeline(input: MovieTimelineInput): Promise<MovieTimelineOutput> {
  return movieTimelineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'movieTimelinePrompt',
  input: {schema: MovieTimelineInputSchema},
  output: {schema: MovieTimelineOutputSchema},
  prompt: `You are a film historian. Provide a list of the most iconic and influential movies from the year {{{year}}}.
  
  Provide {{numberOfRecommendations}} movie titles.
  Format your response as a list of movie titles.
  `,
});

const movieTimelineFlow = ai.defineFlow(
  {
    name: 'movieTimelineFlow',
    inputSchema: MovieTimelineInputSchema,
    outputSchema: MovieTimelineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
