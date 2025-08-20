'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-powered course recommendations
 * based on a user's currently viewed course.
 *
 * - getCourseRecommendations - A function that takes a course as input and returns course recommendations.
 * - CourseRecommendationsInput - The input type for the getCourseRecommendations function.
 * - CourseRecommendationsOutput - The output type for the getCourseRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Course } from '@/types';
import { courses as allCourses } from '@/lib/mock-data';


const CourseRecommendationsInputSchema = z.object({
  course: z.object({
    id: z.string(),
    title: z.string(),
    category: z.string(),
    description: z.string(),
  }),
});
export type CourseRecommendationsInput = z.infer<typeof CourseRecommendationsInputSchema>;

const CourseRecommendationSchema = z.object({
    id: z.string().describe('The ID of the recommended course.'),
    title: z.string().describe('The title of the recommended course.'),
    reason: z.string().describe('A short, compelling reason why this course is being recommended to the user.'),
});

const CourseRecommendationsOutputSchema = z.object({
  recommendations: z.array(CourseRecommendationSchema).describe('A list of recommended courses.'),
});
export type CourseRecommendationsOutput = z.infer<typeof CourseRecommendationsOutputSchema>;

function getOtherCourses(currentCourseId: string): Omit<Course, 'longDescription' | 'reviews' | 'modules' | 'features' | 'instructor' | 'rating' | 'reviewCount' | 'price' | 'imageUrl'>[] {
    return allCourses
        .filter(course => course.id !== currentCourseId)
        .map(({ id, title, category, description }) => ({ id, title, category, description }));
}

export async function getCourseRecommendations(input: CourseRecommendationsInput): Promise<CourseRecommendationsOutput> {
  return courseRecommendationsFlow(input);
}

const courseRecommendationsFlow = ai.defineFlow(
  {
    name: 'courseRecommendationsFlow',
    inputSchema: CourseRecommendationsInputSchema,
    outputSchema: CourseRecommendationsOutputSchema,
  },
  async (input) => {
    const otherCourses = getOtherCourses(input.course.id);

    const prompt = `You are an AI assistant for FunB, an online learning platform. Your goal is to provide high-quality, relevant course recommendations to users.

You will be given the course the user is currently viewing and a catalog of other available courses.

Based on this information, you must recommend 3 other courses that are similar or complementary to the user's interests.

For each recommendation, provide a short, compelling reason (1-2 sentences) explaining *why* it's a good next step for the user.

Current course being viewed:
- Title: ${input.course.title}
- Category: ${input.course.category}
- Description: ${input.course.description}

Here is the catalog of other available courses you can recommend from (in JSON format):
${JSON.stringify(otherCourses)}

Please provide your 3 recommendations in the specified JSON format.
  `;

    const { output } = await ai.generate({
        prompt: prompt,
        output: {
            schema: CourseRecommendationsOutputSchema,
        }
    });

    return output!;
  }
);
