'use server';
/**
 * @fileOverview Provides IMDb and Rotten Tomatoes ratings for a specific TV show.
 *
 * - getExternalTvRatings - A function to get ratings from other platforms for a TV show.
 * - ExternalTvRatingsInput - The input type for the getExternalTvRatings function.
 * - ExternalTvRatingsOutput - The return type for the getExternalTvRatings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExternalTvRatingsInputSchema = z.object({
  tvShowTitle: z.string().describe('The title of the TV show to get ratings for.'),
});
export type ExternalTvRatingsInput = z.infer<typeof ExternalTvRatingsInputSchema>;

const ExternalTvRatingsOutputSchema = z.object({
  imdb: z
    .string()
    .describe(
      'The IMDb rating for the TV show, as a string (e.g., "8.8/10").'
    ),
  rottenTomatoes: z
    .string()
    .describe(
      'The Rotten Tomatoes Tomatometer score, as a string (e.g., "94%").'
    ),
});
export type ExternalTvRatingsOutput = z.infer<typeof ExternalTvRatingsOutputSchema>;

export async function getExternalTvRatings(
  input: ExternalTvRatingsInput
): Promise<ExternalTvRatingsOutput> {
  return getExternalTvRatingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getExternalTvRatingsPrompt',
  input: {schema: ExternalTvRatingsInputSchema},
  output: {schema: ExternalTvRatingsOutputSchema},
  prompt: `You are a TV show database expert. For the TV show "{{tvShowTitle}}", find the official rating from IMDb and the Tomatometer score from Rotten Tomatoes.

  Provide the ratings in the exact requested format.
  `,
});

const getExternalTvRatingsFlow = ai.defineFlow(
  {
    name: 'getExternalTvRatingsFlow',
    inputSchema: ExternalTvRatingsInputSchema,
    outputSchema: ExternalTvRatingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
