
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"
import React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Course } from "@/types"
import { Separator } from "@/components/ui/separator"
import { Trash, GripVertical, PlusCircle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DatePicker } from "@/components/ui/datepicker"
import { useToast } from "@/hooks/use-toast"
import { courses } from "@/lib/mock-data"

// Helper to parse duration string like "1hr 15min"
const parseDuration = (duration: string) => {
    if (!duration) return { hours: 0, minutes: 0 };
    
    let hours = 0;
    let minutes = 0;

    const hourMatch = duration.match(/(\d+)\s*hr|jam/);
    if (hourMatch) {
        hours = parseInt(hourMatch[1], 10);
    }

    const minMatch = duration.match(/(\d+)\s*min|menit/);
    if (minMatch) {
        minutes = parseInt(minMatch[1], 10);
    }
    
    return { hours, minutes };
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.coerce.number().positive(),
  category: z.string(),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }),
  videoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  courseDate: z.date().optional(),
  courseTime: z.string().optional(),
  level: z.string().optional(),
  schedule: z.string().optional(),
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
}).refine(data => {
    for (const module of data.modules) {
        for (const lesson of module.lessons) {
            if ((lesson.durationHours ?? 0) > 0 || (lesson.durationMinutes ?? 0) > 0) {
                return true;
            }
        }
    }
    // We can refine this further if at least one lesson must have a duration
    return true; 
}, {
    // This is a bit of a hack, we can apply the error to a specific lesson if needed
    message: "At least one lesson must have a duration greater than 0.",
    path: ["modules"], 
});


interface EditCourseFormProps {
  course: Course;
}

export function EditCourseForm({ course }: EditCourseFormProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course.title,
      description: course.description,
      price: course.price,
      category: course.category,
      imageUrl: course.imageUrl,
      videoUrl: course.videoUrl || "",
      courseDate: course.courseDate ? new Date(course.courseDate) : undefined,
      courseTime: course.courseTime || "",
      level: course.level || "Beginner",
      schedule: course.schedule || "Flexible",
      features: course.features.map(feature => ({ value: feature })),
      modules: course.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => {
            const { hours, minutes } = parseDuration(lesson.duration);
            return {
                id: lesson.id,
                title: lesson.title,
                durationHours: hours,
                durationMinutes: minutes,
            }
        })
      })),
    },
  })

  const { fields: featureFields, append: appendFeature, remove: removeFeature, move: moveFeature } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const { fields: moduleFields, append: appendModule, remove: removeModule } = useFieldArray({
    control: form.control,
    name: "modules",
  });

  // This handler will be used by both buttons, but with a different status.
  const handleSave = (status: "Published" | "Draft") => async (values: z.infer<typeof formSchema>) => {
    // In a real app, you would handle the form submission here.
    // We'll transform the duration back to a string format.
    const finalValues = {
        ...values,
        status: status, // Add the status here
        modules: values.modules.map(module => ({
            ...module,
            lessons: module.lessons.map(lesson => {
                const { durationHours, durationMinutes } = lesson;
                let durationString = '';
                if (durationHours && durationHours > 0) {
                    durationString += `${durationHours}hr `;
                }
                if (durationMinutes && durationMinutes > 0) {
                    durationString += `${durationMinutes}min`;
                }
                return {
                    id: lesson.id,
                    title: lesson.title,
                    duration: durationString.trim() || '0min',
                }
            })
        }))
    };
    console.log("Updated Course Data:", finalValues);

    // Find the course in our mock data and update it.
    const courseIndex = courses.findIndex(c => c.id === course.id);
    if (courseIndex !== -1) {
        const currentCourse = courses[courseIndex];
        courses[courseIndex] = {
            ...currentCourse,
            ...values,
            price: Number(values.price),
            status: status, // This is where we set the status
            features: values.features.map(f => f.value),
            modules: values.modules.map(m => ({
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
                })
            }))
        };
    }
    

    toast({
        title: `Course ${status === 'Published' ? 'Published' : 'Saved as Draft'}`,
        description: `The course "${values.title}" has been saved successfully.`,
    });

    router.push("/admin/courses");
    router.refresh(); // To force a re-render of the table with updated data
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    moveFeature(draggedIndex, index);
    setDraggedIndex(null);
  };

  const watchedImageUrl = form.watch("imageUrl");
  const watchedVideoUrl = form.watch("videoUrl");

  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>Update the title, description, and media for your course.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. The Complete Web Development Bootcamp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. Learn to build modern web applications..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                       <FormDescription>
                        A short description of the course.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Input placeholder="https://placehold.co/600x400.png" {...field} />
                        </FormControl>
                        {watchedImageUrl && (
                          <Image
                            src={watchedImageUrl}
                            alt="Course image preview"
                            width={120}
                            height={80}
                            className="rounded-md object-cover"
                          />
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Input placeholder="https://example.com/video.mp4" {...field} />
                        </FormControl>
                        {watchedVideoUrl && (
                            <video
                                src={watchedVideoUrl}
                                width="120"
                                height="80"
                                className="rounded-md"
                                muted
                            />
                        )}
                      </div>
                      <FormDescription>
                        URL for the course preview video.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                    <CardDescription>Organize your course into modules and lessons.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Accordion type="multiple" className="w-full">
                            {moduleFields.map((module, moduleIndex) => (
                                <ModuleItem 
                                    key={module.id} 
                                    moduleIndex={moduleIndex} 
                                    control={form.control}
                                    removeModule={removeModule}
                                />
                            ))}
                        </Accordion>
                        
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendModule({ id: `new-mod-${Date.now()}`, title: "", lessons: [] })}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Module
                        </Button>
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price (IDR)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g. 750000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Development">Development</SelectItem>
                                <SelectItem value="Design">Design</SelectItem>
                                <SelectItem value="Business">Business</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="schedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a schedule type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Flexible">Flexible</SelectItem>
                              <SelectItem value="Fixed">Fixed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Jadwal Kursus</CardTitle>
                <CardDescription>Atur tanggal dan waktu pelaksanaan kursus.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <FormField
                  control={form.control}
                  name="courseDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal</FormLabel>
                      <DatePicker 
                        value={field.value}
                        onSelect={field.onChange}
                        className="w-full"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="courseTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waktu</FormLabel>
                       <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>What You'll Learn</CardTitle>
                    <CardDescription>List the key skills students will gain. Drag to reorder.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {featureFields.map((field, index) => (
                        <div
                            key={field.id}
                            className={`flex items-center gap-2 transition-opacity ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(index)}
                        >
                            <Button type="button" variant="ghost" size="icon" className="cursor-grab">
                                <GripVertical />
                                <span className="sr-only">Drag to reorder</span>
                            </Button>
                            <FormField
                                control={form.control}
                                name={`features.${index}.value`}
                                render={({ field }) => (
                                <FormItem className="flex-grow">
                                    <FormControl>
                                        <Input placeholder={`e.g. Master modern web development`} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeFeature(index)}>
                                <Trash />
                                <span className="sr-only">Remove feature</span>
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendFeature({ value: "" })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Feature
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-2">
              <Button onClick={form.handleSubmit(handleSave("Published"))} size="lg" className="w-full">
                Publish
              </Button>
              <Button onClick={form.handleSubmit(handleSave("Draft"))} size="lg" variant="outline" className="w-full">
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}

// Sub-component for a single module in the form
function ModuleItem({ moduleIndex, control, removeModule }: { moduleIndex: number, control: any, removeModule: (index: number) => void }) {
    const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
        control,
        name: `modules.${moduleIndex}.lessons`,
    });

    return (
        <AccordionItem value={`module-${moduleIndex}`} className="bg-muted/50 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-grow">
                    <Button type="button" variant="ghost" size="icon" className="cursor-grab">
                        <GripVertical />
                    </Button>
                    <FormField
                        control={control}
                        name={`modules.${moduleIndex}.title`}
                        render={({ field }) => (
                        <FormItem className="flex-grow">
                            <FormControl>
                                <Input placeholder="Module Title (e.g., Introduction)" {...field} className="font-semibold bg-transparent border-0 shadow-none focus-visible:ring-0"/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <AccordionTrigger />
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeModule(moduleIndex)}>
                        <Trash />
                    </Button>
                </div>
            </div>
            <AccordionContent className="pt-4 pl-12 pr-4 space-y-4">
                 {lessonFields.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="flex items-center gap-2">
                        <GripVertical className="cursor-grab text-muted-foreground"/>
                         <FormField
                            control={control}
                            name={`modules.${moduleIndex}.lessons.${lessonIndex}.title`}
                            render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormControl>
                                    <Input placeholder="Lesson Title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="flex items-start gap-2">
                            <FormField
                                control={control}
                                name={`modules.${moduleIndex}.lessons.${lessonIndex}.durationHours`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Jam</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} className="w-20"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`modules.${moduleIndex}.lessons.${lessonIndex}.durationMinutes`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Menit</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} className="w-20"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeLesson(lessonIndex)}>
                            <Trash className="w-4 h-4"/>
                        </Button>
                    </div>
                ))}

                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendLesson({ id: `new-lesson-${Date.now()}`, title: "", durationHours: 0, durationMinutes: 10 })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Lesson
                </Button>
            </AccordionContent>
        </AccordionItem>
    );
}

    