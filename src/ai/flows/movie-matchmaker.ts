'use server';
/**
 * @fileOverview Provides a movie recommendation that bridges two input movies.
 *
 * - movieMatchmaker - A function to get a movie recommendation based on two other movies.
 * - MovieMatchmakerInput - The input type for the movieMatchmaker function.
 * - MovieMatchmakerOutput - The return type for the movieMatchmaker function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MovieMatchmakerInputSchema = z.object({
  movie1: z.string().describe('The first movie title.'),
  movie2: z.string().describe('The second movie title.'),
});
export type MovieMatchmakerInput = z.infer<typeof MovieMatchmakerInputSchema>;

const MovieMatchmakerOutputSchema = z.object({
  recommendation: z.string().describe('A single movie title that acts as a bridge between the two input movies.'),
});
export type MovieMatchmakerOutput = z.infer<typeof MovieMatchmakerOutputSchema>;

export async function movieMatchmaker(input: MovieMatchmakerInput): Promise<MovieMatchmakerOutput> {
  return movieMatchmakerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'movieMatchmakerPrompt',
  input: {schema: MovieMatchmakerInputSchema},
  output: {schema: MovieMatchmakerOutputSchema},
  prompt: `You are a movie recommendation expert. The user will provide two movie titles. Your task is to find a single movie that serves as a perfect bridge between them. It should share thematic, stylistic, or genre elements from both movies.

  Movie 1: {{{movie1}}}
  Movie 2: {{{movie2}}}
  
  Provide only the title of the recommended movie. Do not provide any explanation.
  `,
});

const movieMatchmakerFlow = ai.defineFlow(
  {
    name: 'movieMatchmakerFlow',
    inputSchema: MovieMatchmakerInputSchema,
    outputSchema: MovieMatchmakerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
