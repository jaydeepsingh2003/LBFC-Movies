'use server';
/**
 * @fileOverview Fetches movies trending in the user's region and among their age group.
 *
 * - getRegionalAgeBasedTrendingMovies - A function that retrieves trending movies based on region and age.
 * - RegionalAgeBasedTrendingMoviesInput - The input type for the getRegionalAgeBasedTrendingMovies function.
 * - RegionalAgeBasedTrendingMoviesOutput - The return type for the getRegionalAgeBasedTrendingMovies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegionalAgeBasedTrendingMoviesInputSchema = z.object({
  region: z.string().describe('The region of the user.'),
  ageGroup: z.string().describe('The age group of the user.'),
});
export type RegionalAgeBasedTrendingMoviesInput = z.infer<
  typeof RegionalAgeBasedTrendingMoviesInputSchema
>;

const RegionalAgeBasedTrendingMoviesOutputSchema = z.object({
  trendingMovies: z
    .array(z.string())
    .describe('A list of movies trending in the specified region and age group.'),
});
export type RegionalAgeBasedTrendingMoviesOutput = z.infer<
  typeof RegionalAgeBasedTrendingMoviesOutputSchema
>;

export async function getRegionalAgeBasedTrendingMovies(
  input: RegionalAgeBasedTrendingMoviesInput
): Promise<RegionalAgeBasedTrendingMoviesOutput> {
  return regionalAgeBasedTrendingMoviesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regionalAgeBasedTrendingMoviesPrompt',
  input: {schema: RegionalAgeBasedTrendingMoviesInputSchema},
  output: {schema: RegionalAgeBasedTrendingMoviesOutputSchema},
  prompt: `You are a movie expert. Based on the user's region and age group, you will return a list of at least 10 movies that are trending in that region and age group.

Region: {{{region}}}
Age Group: {{{ageGroup}}}

Return a list of trending movies.`,
});

const regionalAgeBasedTrendingMoviesFlow = ai.defineFlow(
  {
    name: 'regionalAgeBasedTrendingMoviesFlow',
    inputSchema: RegionalAgeBasedTrendingMoviesInputSchema,
    outputSchema: RegionalAgeBasedTrendingMoviesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
