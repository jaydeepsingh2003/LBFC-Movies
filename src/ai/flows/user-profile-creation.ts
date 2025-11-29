'use server';

/**
 * @fileOverview Analyzes user's movie preferences to build a user profile.
 *
 * - createUserProfile - A function that handles the user profile creation process.
 * - CreateUserProfileInput - The input type for the createUserProfile function.
 * - CreateUserProfileOutput - The return type for the createUserProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateUserProfileInputSchema = z.object({
  moviePreferences: z
    .string()
    .describe('A description of the users preferred movies.'),
});
export type CreateUserProfileInput = z.infer<typeof CreateUserProfileInputSchema>;

const CreateUserProfileOutputSchema = z.object({
  genres: z
    .array(z.string())
    .describe('The preferred genres of the user based on their description.'),
  actors: z
    .array(z.string())
    .describe('The preferred actors of the user based on their description.'),
  directors: z
    .array(z.string())
    .describe('The preferred directors of the user based on their description.'),
  themes: z
    .array(z.string())
    .describe('The preferred themes of the user based on their description.'),
});
export type CreateUserProfileOutput = z.infer<typeof CreateUserProfileOutputSchema>;

export async function createUserProfile(input: CreateUserProfileInput): Promise<CreateUserProfileOutput> {
  return createUserProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createUserProfilePrompt',
  input: {schema: CreateUserProfileInputSchema},
  output: {schema: CreateUserProfileOutputSchema},
  prompt: `You are an expert movie recommender. A user has provided a description of the types of movies they like. Analyze this description and extract their preferred genres, actors, directors and themes, then format as a JSON object with 'genres', 'actors', 'directors', and 'themes' as the keys.

User Description: {{{moviePreferences}}}`,
});

const createUserProfileFlow = ai.defineFlow(
  {
    name: 'createUserProfileFlow',
    inputSchema: CreateUserProfileInputSchema,
    outputSchema: CreateUserProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
