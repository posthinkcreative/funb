import { z } from "zod";

export const courseFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number(),
  discountType: z.enum(['none', 'percentage', 'nominal']).optional(),
  discountValue: z.coerce.number().optional(),
  category: z.string(),
  imageUrl: z.string().min(1, { message: "An image is required." }),
  videoUrl: z.string().optional(),
  courseDate: z.date().optional(),
  courseTime: z.string().optional(),
  level: z.string().optional(),
  schedule: z.string().optional(),
  status: z.enum(['Published', 'Draft', 'Archived']),
  features: z.array(z.object({ value: z.string().min(1, { message: "Please enter a value." }) })),
  modules: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(1, { message: "Module title is required." }),
      lessons: z.array(
        z.object({
          id: z.string(),
          title: z.string().min(1, { message: "Lesson title is required." }),
          durationHours: z.coerce.number().min(0).optional(),
          durationMinutes: z.coerce.number().min(0).optional(),
        })
      ),
    })
  ),
});
