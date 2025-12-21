
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MovieTimelineInputSchema = z.object({
  movieFranchise: z
    .string()
    .describe('The movie franchise to create a timeline for.'),
});
export type MovieTimelineInput = z.infer<typeof MovieTimelineInputSchema>;

const MovieTimelineOutputSchema = z.object({
  timeline: z
    .array(
      z.object({
        movieTitle: z.string().describe('The title of the movie.'),
        releaseYear: z.number().describe('The release year of the movie.'),
        description: z
          .string()
          .describe('A short description of the movie plot.'),
      })
    )
    .describe(
      'An array of movies in the franchise, ordered by their release year.'
    ),
});
export type MovieTimelineOutput = z.infer<typeof MovieTimelineOutputSchema>;

export async function getMovieTimeline(
  input: MovieTimelineInput
): Promise<MovieTimelineOutput> {
  return movieTimelineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'movieTimelinePrompt',
  input: {schema: MovieTimelineInputSchema},
  output: {schema: MovieTimelineOutputSchema},
  prompt: `You are a film expert. Create a chronological timeline of the movies in the "{{movieFranchise}}" franchise. 
  
  For each movie, provide the title, release year, and a brief one-sentence description of its plot.
  
  Order the movies by their release year, from earliest to most recent.`,
});

const movieTimelineFlow = ai.defineFlow(
  {
    name: 'movieTimelineFlow',
    inputSchema: MovieTimelineInputSchema,
    outputSchema: MovieTimelineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
