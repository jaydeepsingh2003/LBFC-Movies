'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing movie recommendations based on user's preferred languages.
 *
 * The flow takes a user's preferred languages as input and returns a list of movie recommendations in those languages.
 * @param input - An object containing the user's preferred languages.
 * @returns An object containing a list of movie recommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LanguageBasedMoviePicksInputSchema = z.object({
  languages: z
    .array(z.string())
    .describe('An array of the user preferred languages.'),
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
  prompt: `You are a movie expert. Recommend a list of 10 movies in the following languages: {{{languages}}}. Return a JSON array of strings.`,
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
