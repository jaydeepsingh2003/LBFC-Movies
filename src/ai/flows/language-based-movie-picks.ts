'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing movie recommendations based on user's preferred languages and optionally by year.
 *
 * The flow takes a user's preferred languages and an optional year as input and returns a list of movie recommendations.
 * @param input - An object containing the user's preferred languages and optional year.
 * @returns An object containing a list of movie recommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LanguageBasedMoviePicksInputSchema = z.object({
  languages: z
    .array(z.string())
    .describe('An array of the user preferred languages.'),
  numberOfRecommendations: z.number().optional().default(15),
  year: z.number().optional().describe('The release year of the movies to recommend.')
});
export type LanguageBasedMoviePicksInput = z.infer<
  typeof LanguageBasedMoviePicksInputSchema
>;

const LanguageBasedMoviePicksOutputSchema = z.object({
  movieRecommendations: z
    .array(z.string())
    .describe('A list of movie recommendations in the preferred languages.'),
});
export type LanguageBasedMoviePicksOutput = z.infer<
  typeof LanguageBasedMoviePicksOutputSchema
>;

export async function languageBasedMoviePicks(
  input: LanguageBasedMoviePicksInput
): Promise<LanguageBasedMoviePicksOutput> {
  return languageBasedMoviePicksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'languageBasedMoviePicksPrompt',
  input: {schema: LanguageBasedMoviePicksInputSchema},
  output: {schema: LanguageBasedMoviePicksOutputSchema},
  prompt: `You are a movie expert. Recommend a list of {{numberOfRecommendations}} movies in the following languages: {{{languages}}}{{#if year}} from the year {{year}}{{/if}}. Return a JSON array of strings.`,
});

const languageBasedMoviePicksFlow = ai.defineFlow(
  {
    name: 'languageBasedMoviePicksFlow',
    inputSchema: LanguageBasedMoviePicksInputSchema,
    outputSchema: LanguageBasedMoviePicksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
