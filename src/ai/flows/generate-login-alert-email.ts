
'use server';
/**
 * @fileOverview Generates professional security alert email content for login events.
 *
 * - generateLoginAlertEmail - Function to create the email content.
 * - LoginAlertInput - The input type containing user and event details.
 * - LoginAlertOutput - The return type containing subject and body.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LoginAlertInputSchema = z.object({
  displayName: z.string().describe('The display name of the user.'),
  email: z.string().email().describe('The email address of the user.'),
  timestamp: z.string().describe('The time of login.'),
});
export type LoginAlertInput = z.infer<typeof LoginAlertInputSchema>;

const LoginAlertOutputSchema = z.object({
  subject: z.string().describe('The subject line of the email.'),
  text: z.string().describe('The plain text body of the email.'),
  html: z.string().describe('The HTML formatted body of the email.'),
});
export type LoginAlertOutput = z.infer<typeof LoginAlertOutputSchema>;

export async function generateLoginAlertEmail(input: LoginAlertInput): Promise<LoginAlertOutput> {
  return generateLoginAlertEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLoginAlertEmailPrompt',
  input: {schema: LoginAlertInputSchema},
  output: {schema: LoginAlertOutputSchema},
  prompt: `You are a professional security communication expert for LBFC (The AI Movie Hub). 
  A user has just logged into their account. Generate a high-fidelity, reassuring but security-conscious login alert email.

  User Details:
  - Name: {{{displayName}}}
  - Email: {{{email}}}
  - Login Time: {{{timestamp}}}

  The email should:
  1. Confirm the login happened.
  2. Include a professional subject line.
  3. Provide both a plain text and a beautifully formatted HTML version.
  4. Use cinematic, premium language consistent with a high-end movie hub.
  `,
});

const generateLoginAlertEmailFlow = ai.defineFlow(
  {
    name: 'generateLoginAlertEmailFlow',
    inputSchema: LoginAlertInputSchema,
    outputSchema: LoginAlertOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
