'use server';
/**
 * @fileOverview Provides behind-the-scenes trivia for a specific movie.
 *
 * - getMovieTrivia - A function to get trivia, goofs, and facts.
 * - MovieTriviaInput - The input type for the getMovieTrivia function.
 * - MovieTriviaOutput - The return type for the getMovieTrivia function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MovieTriviaInputSchema = z.object({
  movieTitle: z.string().describe('The title of the movie to get trivia for.'),
});
export type MovieTriviaInput = z.infer<typeof MovieTriviaInputSchema>;

const MovieTriviaOutputSchema = z.object({
  behindTheScenes: z.array(z.string()).describe("A list of interesting behind-the-scenes facts about the movie's production."),
  trivia: z.array(z.string()).describe('A list of general trivia points about the movie.'),
  goofs: z.array(z.string()).describe('A list of continuity errors or goofs found in the movie.'),
});
export type MovieTriviaOutput = z.infer<typeof MovieTriviaOutputSchema>;

export async function getMovieTrivia(input: MovieTriviaInput): Promise<MovieTriviaOutput> {
  return getMovieTriviaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMovieTriviaPrompt',
  input: {schema: MovieTriviaInputSchema},
  output: {schema: MovieTriviaOutputSchema},
  prompt: `You are a film historian and expert researcher. For the movie "{{movieTitle}}", provide a list of interesting facts for the following categories:
  - Behind-the-scenes production details.
  - General trivia about the film, cast, and crew.
  - Any notable goofs or continuity errors.

  Provide at least 3 points for each category if available.
  `,
});

const getMovieTriviaFlow = ai.defineFlow(
  {
    name: 'getMovieTriviaFlow',
    inputSchema: MovieTriviaInputSchema,
    outputSchema: MovieTriviaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
