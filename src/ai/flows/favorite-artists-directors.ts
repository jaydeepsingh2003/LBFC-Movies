'use server';
/**
 * @fileOverview Provides movie recommendations based on favorite actors and directors.
 *
 * - getFavoriteArtistsDirectorsRecommendations - A function to get movie recommendations based on favorite artists and directors.
 * - FavoriteArtistsDirectorsInput - The input type for the getFavoriteArtistsDirectorsRecommendations function.
 * - FavoriteArtistsDirectorsOutput - The return type for the getFavoriteArtistsDirectorsRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FavoriteArtistsDirectorsInputSchema = z.object({
  favoriteActors: z.array(z.string()).describe('List of favorite actors.'),
  favoriteDirectors: z.array(z.string()).describe('List of favorite directors.'),
});
export type FavoriteArtistsDirectorsInput = z.infer<typeof FavoriteArtistsDirectorsInputSchema>;

const FavoriteArtistsDirectorsOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('List of recommended movies based on favorite actors and directors.'),
});
export type FavoriteArtistsDirectorsOutput = z.infer<typeof FavoriteArtistsDirectorsOutputSchema>;

export async function getFavoriteArtistsDirectorsRecommendations(input: FavoriteArtistsDirectorsInput): Promise<FavoriteArtistsDirectorsOutput> {
  return favoriteArtistsDirectorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'favoriteArtistsDirectorsPrompt',
  input: {schema: FavoriteArtistsDirectorsInputSchema},
  output: {schema: FavoriteArtistsDirectorsOutputSchema},
  prompt: `You are a movie recommendation expert. Based on the user's favorite actors and directors, provide a list of movie recommendations.

  Favorite Actors: {{#each favoriteActors}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Favorite Directors: {{#each favoriteDirectors}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  
  Consider suggesting movies featuring these actors, directed by these directors, or similar artists/directors and related content.
  Format your response as a list of movie titles.
  `,
});

const favoriteArtistsDirectorsFlow = ai.defineFlow(
  {
    name: 'favoriteArtistsDirectorsFlow',
    inputSchema: FavoriteArtistsDirectorsInputSchema,
    outputSchema: FavoriteArtistsDirectorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
