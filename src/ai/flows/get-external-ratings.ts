'use server';
/**
 * @fileOverview Provides IMDb and Rotten Tomatoes ratings for a specific movie.
 *
 * - getExternalRatings - A function to get ratings from other platforms.
 * - ExternalRatingsInput - The input type for the getExternalRatings function.
 * - ExternalRatingsOutput - The return type for the getExternalRatings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExternalRatingsInputSchema = z.object({
  movieTitle: z.string().describe('The title of the movie to get ratings for.'),
});
export type ExternalRatingsInput = z.infer<typeof ExternalRatingsInputSchema>;

const ExternalRatingsOutputSchema = z.object({
  imdb: z
    .string()
    .describe(
      'The IMDb rating for the movie, as a string (e.g., "8.8/10").'
    ),
  rottenTomatoes: z
    .string()
    .describe(
      'The Rotten Tomatoes Tomatometer score, as a string (e.g., "94%").'
    ),
});
export type ExternalRatingsOutput = z.infer<typeof ExternalRatingsOutputSchema>;

export async function getExternalRatings(
  input: ExternalRatingsInput
): Promise<ExternalRatingsOutput> {
  return getExternalRatingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getExternalRatingsPrompt',
  input: {schema: ExternalRatingsInputSchema},
  output: {schema: ExternalRatingsOutputSchema},
  prompt: `You are a movie database expert. For the movie "{{movieTitle}}", find the official rating from IMDb and the Tomatometer score from Rotten Tomatoes.

  Provide the ratings in the exact requested format.
  `,
});

const getExternalRatingsFlow = ai.defineFlow(
  {
    name: 'getExternalRatingsFlow',
    inputSchema: ExternalRatingsInputSchema,
    outputSchema: ExternalRatingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
