'use server';

/**
 * @fileOverview AI-Powered Movie Search Flow.
 *
 * This flow allows users to search for movies using natural language queries.
 * The AI understands the intent and context of the search query.
 *
 * @exports searchMovies - Function to initiate the movie search flow.
 * @exports SearchMoviesInput - Input type for the searchMovies function.
 * @exports SearchMoviesOutput - Output type for the searchMovies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchMoviesInputSchema = z.object({
  query: z.string().describe('The natural language search query for movies.'),
});
export type SearchMoviesInput = z.infer<typeof SearchMoviesInputSchema>;

const SearchMoviesOutputSchema = z.object({
  results: z
    .array(z.string())
    .describe('A list of movie titles that match the search query.'),
});
export type SearchMoviesOutput = z.infer<typeof SearchMoviesOutputSchema>;

export async function searchMovies(input: SearchMoviesInput): Promise<SearchMoviesOutput> {
  return searchMoviesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchMoviesPrompt',
  input: {schema: SearchMoviesInputSchema},
  output: {schema: SearchMoviesOutputSchema},
  prompt: `You are a movie expert. Based on the user's query, you will provide a list of movie titles that match the query. Only provide movie titles.

Query: {{{query}}}`,
});

const searchMoviesFlow = ai.defineFlow(
  {
    name: 'searchMoviesFlow',
    inputSchema: SearchMoviesInputSchema,
    outputSchema: SearchMoviesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
