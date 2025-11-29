'use server';

/**
 * @fileOverview Generates movie recommendations based on a selected mood.
 *
 * - getMoodBasedRecommendations - A function that takes a mood as input and returns personalized movie suggestions.
 * - MoodBasedRecommendationsInput - The input type for the getMoodBasedRecommendations function.
 * - MoodBasedRecommendationsOutput - The return type for the getMoodBasedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MoodBasedRecommendationsInputSchema = z.object({
  mood: z.string().describe('The mood for which to generate movie recommendations (e.g., happy, sad, adventurous).'),
});
export type MoodBasedRecommendationsInput = z.infer<typeof MoodBasedRecommendationsInputSchema>;

const MoodBasedRecommendationsOutputSchema = z.object({
  movieSuggestions: z.array(z.string()).describe('An array of movie titles that match the given mood.'),
});
export type MoodBasedRecommendationsOutput = z.infer<typeof MoodBasedRecommendationsOutputSchema>;

export async function getMoodBasedRecommendations(input: MoodBasedRecommendationsInput): Promise<MoodBasedRecommendationsOutput> {
  return moodBasedRecommendationsFlow(input);
}

const moodBasedRecommendationsPrompt = ai.definePrompt({
  name: 'moodBasedRecommendationsPrompt',
  input: {schema: MoodBasedRecommendationsInputSchema},
  output: {schema: MoodBasedRecommendationsOutputSchema},
  prompt: `You are a movie expert. Given the mood: {{{mood}}}, suggest a list of movies that would be appropriate for that mood. Return just the names of the movies. No explanation required. Return at least 3 movies.

Movies:`,
});

const moodBasedRecommendationsFlow = ai.defineFlow(
  {
    name: 'moodBasedRecommendationsFlow',
    inputSchema: MoodBasedRecommendationsInputSchema,
    outputSchema: MoodBasedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await moodBasedRecommendationsPrompt(input);
    return output!;
  }
);
