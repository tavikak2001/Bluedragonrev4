'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating AI-powered insights
 * from monthly timesheet data, helping administrators understand productivity fluctuations
 * and unusual overtime patterns.
 *
 * - adminTimesheetInsights - A function that handles the generation of insights.
 * - AdminTimesheetInsightsInput - The input type for the adminTimesheetInsights function.
 * - AdminTimesheetInsightsOutput - The return type for the adminTimesheetInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdminTimesheetDailyRecordSchema = z.object({
  date: z.string().describe('The date of the timesheet entry in YYYY-MM-DD format.'),
  employeeId: z.string().describe('The ID of the employee.'),
  employeeName: z.string().describe('The full name of the employee.'),
  projectId: z.string().optional().describe('The ID of the project worked on, if applicable.'),
  projectName: z.string().optional().describe('The name of the project worked on, if applicable.'),
  totalWorkingHours: z.number().min(0).describe('Total normal working hours for the day.'),
  totalOtHours: z.number().min(0).describe('Total overtime hours for the day.'),
  remarks: z.string().optional().describe('Any specific remarks or notes for the day (e.g., sick leave, project deadline).'),
});

const AdminTimesheetInsightsInputSchema = z.object({
  monthYear: z.string().describe('The month and year for which insights are requested (e.g., "January 2024").'),
  dailyRecords: z.array(AdminTimesheetDailyRecordSchema).describe('An array of daily timesheet records for the specified month.'),
  additionalContext: z.string().optional().describe('Any additional context about company operations, ongoing projects, or known events for the month.'),
});
export type AdminTimesheetInsightsInput = z.infer<typeof AdminTimesheetInsightsInputSchema>;

const AdminTimesheetInsightsOutputSchema = z.object({
  overallSummary: z.string().describe('An overall summary of the employee activity and patterns for the month.'),
  productivityFluctuations: z.array(z.object({
    period: z.string().describe('The period during which the fluctuation occurred (e.g., "Week 2", "Jan 10-12").'),
    description: z.string().describe('A description of the observed productivity fluctuation (e.g., "Lower than average working hours observed").'),
    potentialReasons: z.array(z.string()).describe('Potential reasons identified for the fluctuation based on the data and context.'),
  })).describe('Identified periods of productivity fluctuations and their potential causes.'),
  unusualOvertimePatterns: z.array(z.object({
    period: z.string().describe('The period during which unusual overtime occurred (e.g., "Last week of the month").'),
    description: z.string().describe('A description of the unusual overtime pattern (e.g., "Significant spike in OT hours on Project X").'),
    potentialReasons: z.array(z.string()).describe('Potential reasons identified for the unusual overtime.'),
  })).describe('Identified patterns of unusual overtime and their potential causes.'),
  recommendations: z.array(z.string()).describe('Actionable recommendations based on the insights to improve management decisions.'),
});
export type AdminTimesheetInsightsOutput = z.infer<typeof AdminTimesheetInsightsOutputSchema>;

export async function adminTimesheetInsights(input: AdminTimesheetInsightsInput): Promise<AdminTimesheetInsightsOutput> {
  return adminTimesheetInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminTimesheetInsightsPrompt',
  input: { schema: AdminTimesheetInsightsInputSchema },
  output: { schema: AdminTimesheetInsightsOutputSchema },
  prompt: `You are an AI assistant specialized in analyzing monthly timesheet data to provide actionable insights for administrators. Your goal is to identify productivity fluctuations, unusual overtime patterns, and suggest potential reasons and recommendations.

Analyze the provided daily timesheet records for the month and year: {{{monthYear}}}.

Here are the daily timesheet records:
{{#each dailyRecords}}
Date: {{{date}}}, Employee ID: {{{employeeId}}}, Employee Name: {{{employeeName}}}, Project: {{{projectName}}}{{#if projectName}} ({{{projectId}}}){{/if}}, Working Hours: {{{totalWorkingHours}}}, OT Hours: {{{totalOtHours}}}{{#if remarks}}, Remarks: {{{remarks}}}{{/if}}
{{/each}}

{{#if additionalContext}}
Additional Context provided: {{{additionalContext}}}
{{/if}}

Based on the data and any provided context, generate a structured JSON output that includes:
1.  An 'overallSummary' of the employee activity and patterns for the month.
2.  An array 'productivityFluctuations' detailing any periods of lower or higher than usual working hours, their descriptions, and potential reasons.
3.  An array 'unusualOvertimePatterns' detailing any significant spikes or prolonged periods of overtime, their descriptions, and potential reasons.
4.  An array 'recommendations' providing actionable advice for management based on your findings.

Consider factors like:
-   Consistency of working hours.
-   Relationship between remarks (e.g., sick leave, project deadlines) and fluctuations/overtime.
-   Daily averages vs. significant deviations.
-   Patterns across different employees or projects if identifiable from the employee/project IDs and names.

Make sure the output strictly adheres to the JSON schema, including all specified fields and their types. Do not include any conversational text outside the JSON block.
`,
});

const adminTimesheetInsightsFlow = ai.defineFlow(
  {
    name: 'adminTimesheetInsightsFlow',
    inputSchema: AdminTimesheetInsightsInputSchema,
    outputSchema: AdminTimesheetInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
