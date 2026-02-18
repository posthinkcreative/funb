import { z } from "zod";

export const courseFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Slug must be lowercase alphanumeric with dashes." }).min(3, { message: "Slug is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number(),
  discountType: z.enum(['none', 'percentage', 'nominal']).optional(),
  discountValue: z.coerce.number().optional(),
  category: z.string(),
  instructorId: z.string().optional(),
  newInstructorName: z.string().optional(),
  newInstructorTitle: z.string().optional(),
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
}).superRefine((data, ctx) => {
  if (!data.instructorId && !data.newInstructorName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select an existing instructor or enter a new one.",
      path: ["instructorId"],
    });
  }
  if (data.instructorId && data.newInstructorName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please either select an instructor or enter a new one, not both.",
      path: ["newInstructorName"],
    });
  }
});
