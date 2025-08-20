'use server';

import { getCourseRecommendations, type CourseRecommendationsInput, type CourseRecommendationsOutput } from '@/ai/flows/course-recommendations';

export async function runCourseRecommendations(input: CourseRecommendationsInput): Promise<CourseRecommendationsOutput> {
  // In a real application, you would add authentication and authorization checks here
  // to ensure only logged-in users can access this functionality.
  
  try {
    const recommendations = await getCourseRecommendations(input);
    return recommendations;
  } catch (error) {
    console.error('Error fetching course recommendations:', error);
    // It's better to throw a more generic error to the client
    throw new Error('An unexpected error occurred while generating recommendations. Please try again later.');
  }
}
