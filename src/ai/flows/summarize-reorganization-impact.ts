// SummarizeReorganizationImpact.ts
'use server';

/**
 * @fileOverview Summarizes the impact of reorganization changes, focusing on cost and job changes.
 *
 * - summarizeReorganizationImpact - A function that summarizes the impact of reorganization.
 * - SummarizeReorganizationImpactInput - The input type for the summarizeReorganizationImpact function.
 * - SummarizeReorganizationImpactOutput - The return type for the summarizeReorganizationImpact function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeReorganizationImpactInputSchema = z.object({
  originalHierarchy: z
    .string()
    .describe('The original organization hierarchy in JSON format.'),
  revisedHierarchy: z
    .string()
    .describe('The revised organization hierarchy in JSON format after reorganization.'),
});
export type SummarizeReorganizationImpactInput = z.infer<typeof SummarizeReorganizationImpactInputSchema>;

const SummarizeReorganizationImpactOutputSchema = z.object({
  summary: z.string().describe('A summary of the reorganization impact.'),
  costChange: z.number().describe('The change in total proforma cost.'),
  jobsAdded: z.array(z.string()).describe('The kinds of jobs added.'),
  jobsRemoved: z.array(z.string()).describe('The kinds of jobs removed.'),
  jobsCovered: z.array(z.string()).describe('The kinds of jobs currently covered.')
});
export type SummarizeReorganizationImpactOutput = z.infer<typeof SummarizeReorganizationImpactOutputSchema>;

export async function summarizeReorganizationImpact(input: SummarizeReorganizationImpactInput): Promise<SummarizeReorganizationImpactOutput> {
  return summarizeReorganizationImpactFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeReorganizationImpactPrompt',
  input: {schema: SummarizeReorganizationImpactInputSchema},
  output: {schema: SummarizeReorganizationImpactOutputSchema},
  prompt: `You are an AI assistant that summarizes the impact of organizational changes.

  You are given the original and revised organization hierarchies in JSON format.
  Your task is to summarize the changes, focusing on the financial and structural implications.
  Specifically, you should identify the change in total proforma cost, the kinds of jobs added, the kinds of jobs removed and the kinds of jobs covered in the revised hierarchy.
  Summarize this information in a concise and easy-to-understand manner.

Original Hierarchy: {{{originalHierarchy}}}
Revised Hierarchy: {{{revisedHierarchy}}}

Summary format should be:
Summary: <summary of changes>
costChange: <change in total proforma cost>
jobsAdded: <list of jobs added>
jobsRemoved: <list of jobs removed>
jobsCovered: <list of jobs covered>
`,
});

const summarizeReorganizationImpactFlow = ai.defineFlow(
  {
    name: 'summarizeReorganizationImpactFlow',
    inputSchema: SummarizeReorganizationImpactInputSchema,
    outputSchema: SummarizeReorganizationImpactOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
