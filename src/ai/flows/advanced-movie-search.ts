'use server';
/**
 * @fileOverview Provides advanced movie search with multiple filter criteria.
 *
 * - advancedMovieSearch - A function to get movie recommendations based on multiple filters.
 * - AdvancedMovieSearchInput - The input type for the advancedMovieSearch function.
 * - AdvancedMovieSearchOutput - The return type for the advancedMovieSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdvancedMovieSearchInputSchema = z.object({
  genre: z.string().optional().describe('The genre of the movie.'),
  releaseYear: z.array(z.number()).optional().describe('A range of release years for the movie.'),
  actors: z.array(z.string()).optional().describe('A list of actors in the movie.'),
  directors: z.array(z.string()).optional().describe('A list of directors of the movie.'),
  rating: z.array(z.number()).optional().describe('A range for the user rating of the movie (e.g., 7 to 10).'),
  numberOfRecommendations: z.number().optional().default(12).describe('Number of movies to recommend.'),
});
export type AdvancedMovieSearchInput = z.infer<typeof AdvancedMovieSearchInputSchema>;

const AdvancedMovieSearchOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('List of recommended movies based on the provided criteria.'),
});
export type AdvancedMovieSearchOutput = z.infer<typeof AdvancedMovieSearchOutputSchema>;

export async function advancedMovieSearch(input: AdvancedMovieSearchInput): Promise<AdvancedMovieSearchOutput> {
  return advancedMovieSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'advancedMovieSearchPrompt',
  input: {schema: AdvancedMovieSearchInputSchema},
  output: {schema: AdvancedMovieSearchOutputSchema},
  prompt: `You are a movie recommendation expert. Based on the user's criteria, provide a list of movie recommendations.

  {{#if genre}}Genre: {{{genre}}}{{/if}}
  {{#if releaseYear}}Release Year between: {{releaseYear.[0]}} and {{releaseYear.[1]}}{{/if}}
  {{#if actors}}Actors: {{#each actors}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
  {{#if directors}}Directors: {{#each directors}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
  {{#if rating}}User Rating between: {{rating.[0]}} and {{rating.[1]}} out of 10{{/if}}
  
  Provide {{numberOfRecommendations}} movie titles.
  Format your response as a list of movie titles.
  `,
});

const advancedMovieSearchFlow = ai.defineFlow(
  {
    name: 'advancedMovieSearchFlow',
    inputSchema: AdvancedMovieSearchInputSchema,
    outputSchema: AdvancedMovieSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
