'use server';

/**
 * @fileOverview A personalized movie recommendation AI agent based on viewing history.
 *
 * - getPersonalizedRecommendations - A function that handles the movie recommendation process.
 * - PersonalizedRecommendationsInput - The input type for the getPersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the getPersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  viewingHistory: z
    .array(z.string())
    .describe('An array of movie titles the user has watched.'),
  numberOfRecommendations: z
    .number()
    .default(5)
    .describe('The number of movie recommendations to generate.'),
});
export type PersonalizedRecommendationsInput = z.infer<
  typeof PersonalizedRecommendationsInputSchema
>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('An array of movie titles recommended to the user.'),
});
export type PersonalizedRecommendationsOutput = z.infer<
  typeof PersonalizedRecommendationsOutputSchema
>;

export async function getPersonalizedRecommendations(
  input: PersonalizedRecommendationsInput
): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are a movie recommendation expert. Based on the user's viewing history, you will suggest movies that they might like.

  Here is the user's viewing history:
  {{#each viewingHistory}}- {{this}}\n{{/each}}

  Please provide {{numberOfRecommendations}} movie recommendations.
  The output should be a list of movie titles.

  Make sure that the movie recommendations are not already in the user's viewing history.
  Do not include any explanations, just the list of movie titles.
  `,
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
