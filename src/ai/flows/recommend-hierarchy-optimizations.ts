// Recommend hierarchy optimizations based on organizational structure best practices.
'use server';

/**
 * @fileOverview AI-powered hierarchy optimization recommendations.
 *
 * - recommendHierarchyOptimizations - A function that analyzes the organization's hierarchy and provides recommendations for optimizations.
 * - RecommendHierarchyOptimizationsInput - The input type for the recommendHierarchyOptimizations function.
 * - RecommendHierarchyOptimizationsOutput - The return type for the recommendHierarchyOptimizations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendHierarchyOptimizationsInputSchema = z.object({
  organizationHierarchy: z
    .string()
    .describe(
      'A string representation of the organization hierarchy, including employee names, roles, reporting structure, and other relevant attributes such as department, location, and cost.'
    ),
  organizationalGoals: z
    .string()
    .describe(
      'A description of the organization goals to optimize for - for example, cost reduction, increased efficiency, improved communication, etc.'
    ),
});
export type RecommendHierarchyOptimizationsInput = z.infer<
  typeof RecommendHierarchyOptimizationsInputSchema
>;

const RecommendHierarchyOptimizationsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the analysis of the organization hierarchy and the recommendations for optimizations.'
    ),
  recommendations: z.array(
    z.object({
      area: z
        .string()
        .describe(
          'The area of the organization that the recommendation applies to.'
        ),
      optimization: z
        .string()
        .describe(
          'A description of the optimization that is recommended, and the reasons for the recommendation.  This should include specific reassignments, role changes, or structural adjustments to address imbalances or inefficiencies.'
        ),
      potentialImpact: z
        .string()
        .describe(
          'A description of the potential impact of the optimization on the organization, including cost savings, efficiency gains, or improved communication.'
        ),
    })
  ),
});
export type RecommendHierarchyOptimizationsOutput = z.infer<
  typeof RecommendHierarchyOptimizationsOutputSchema
>;

export async function recommendHierarchyOptimizations(
  input: RecommendHierarchyOptimizationsInput
): Promise<RecommendHierarchyOptimizationsOutput> {
  return recommendHierarchyOptimizationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendHierarchyOptimizationsPrompt',
  input: {schema: RecommendHierarchyOptimizationsInputSchema},
  output: {schema: RecommendHierarchyOptimizationsOutputSchema},
  prompt: `You are an expert in organizational structure and design. Analyze the provided organization hierarchy and provide recommendations for optimizations based on organizational structure best practices, with the organizational goals in mind.

Organization Hierarchy:
{{organizationHierarchy}}

Organizational Goals:
{{organizationalGoals}}

Provide a summary of your analysis and a list of specific recommendations, including the area of the organization they apply to, a description of the optimization, and the potential impact of the optimization. The recommendations should include specific reassignments, role changes, or structural adjustments to address imbalances or inefficiencies.

Ensure that the output is valid JSON matching the schema description for RecommendHierarchyOptimizationsOutputSchema.  The \"area\" field should indicate the department or division the recommendation applies to.
`,
});

const recommendHierarchyOptimizationsFlow = ai.defineFlow(
  {
    name: 'recommendHierarchyOptimizationsFlow',
    inputSchema: RecommendHierarchyOptimizationsInputSchema,
    outputSchema: RecommendHierarchyOptimizationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
