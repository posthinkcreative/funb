
'use server';

import { revalidatePath } from 'next/cache';
import { courses } from '@/lib/mock-data';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  category: z.string(),
  imageUrl: z.string().url(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  courseDate: z.date().optional(),
  courseTime: z.string().optional(),
  level: z.string().optional(),
  schedule: z.string().optional(),
  status: z.enum(['Published', 'Draft']),
  features: z.array(z.object({ value: z.string().min(1) })),
  modules: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(1),
      lessons: z.array(
        z.object({
          id: z.string(),
          title: z.string().min(1),
          durationHours: z.coerce.number().min(0).optional(),
          durationMinutes: z.coerce.number().min(0).optional(),
        })
      ),
    })
  ),
});

type UpdateCourseData = z.infer<typeof formSchema>;

export async function updateCourse(courseId: string, data: UpdateCourseData) {
  try {
    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex === -1) {
      return { success: false, error: "Course not found." };
    }

    const currentCourse = courses[courseIndex];

    // Combine current course data with new data
    courses[courseIndex] = {
      ...currentCourse,
      ...data,
      price: Number(data.price),
      features: data.features.map(f => f.value),
      modules: data.modules.map(m => ({
        id: m.id,
        title: m.title,
        lessons: m.lessons.map(l => {
          const { durationHours, durationMinutes } = l;
          let durationString = '';
          if (durationHours && durationHours > 0) {
            durationString += `${durationHours}hr `;
          }
          if (durationMinutes && durationMinutes > 0) {
            durationString += `${durationMinutes}min`;
          }
          return {
            id: l.id,
            title: l.title,
            duration: durationString.trim() || '0min',
          };
        }),
      })),
    };
    
    // Revalidate paths to show updated data
    revalidatePath('/admin/courses');
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/`);

    return { success: true, course: courses[courseIndex] };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}
