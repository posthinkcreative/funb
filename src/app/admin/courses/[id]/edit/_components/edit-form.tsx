
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
import { Trash, GripVertical, PlusCircle, ArrowUp, ArrowDown } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DatePicker } from "@/components/ui/datepicker"
import { useToast } from "@/hooks/use-toast"
import { updateCourse } from "@/actions/courses"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

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
  status: z.enum(['Published', 'Draft']),
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

interface EditCourseFormProps {
  course: Course;
}

export function EditCourseForm({ course }: EditCourseFormProps) {
  const [draggedFeatureIndex, setDraggedFeatureIndex] = React.useState<number | null>(null);
  const [draggedModuleIndex, setDraggedModuleIndex] = React.useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

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
      status: course.status,
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

  const { fields: moduleFields, append: appendModule, remove: removeModule, move: moveModule } = useFieldArray({
    control: form.control,
    name: "modules",
  });

  const handleSave = (status: "Published" | "Draft") => async (values: z.infer<typeof formSchema>) => {
    try {
        const result = await updateCourse(course.id, { ...values, status });

        if (!result.success) {
            toast({
                title: `Error Saving Course`,
                description: result.error,
                variant: 'destructive',
            });
            return;
        }

        toast({
            title: `Course ${status === 'Published' ? 'Published' : 'Saved as Draft'}`,
            description: `The course "${values.title}" has been saved successfully.`,
        });
        
        router.push("/admin/courses");
        router.refresh(); 

    } catch (error) {
        console.error("Failed to update course:", error);
        toast({
            title: `Error`,
            description: "An unexpected error occurred while saving the course.",
            variant: 'destructive',
        });
    }
  };

  const handleFeatureDragStart = (index: number) => {
    setDraggedFeatureIndex(index);
  };

  const handleFeatureDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); 
  };

  const handleFeatureDrop = (index: number) => {
    if (draggedFeatureIndex === null) return;
    moveFeature(draggedFeatureIndex, index);
    setDraggedFeatureIndex(null);
  };

  const handleModuleDragStart = (index: number) => {
    setDraggedModuleIndex(index);
  };

  const handleModuleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleModuleDrop = (index: number) => {
    if (draggedModuleIndex === null) return;
    moveModule(draggedModuleIndex, index);
    setDraggedModuleIndex(null);
  };

  const watchedImageUrl = form.watch("imageUrl");
  const watchedVideoUrl = form.watch("videoUrl");

  if (!isMounted) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                        <CardContent className="space-y-6">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                        <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                        <CardContent className="space-y-6">
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                        <CardContent className="space-y-6">
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                         <CardContent><Skeleton className="h-32 w-full" /></CardContent>
                    </Card>
                    <div className="space-y-2">
                        <Skeleton className="h-11 w-full" />
                        <Skeleton className="h-11 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
  }


  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
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
                    <CardDescription>Organize your course into modules and lessons. Drag to reorder or use arrows.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Accordion type="multiple" className="w-full" defaultValue={[`module-${moduleFields[0]?.id}`]}>
                            {moduleFields.map((module, moduleIndex) => (
                                <div
                                    key={module.id}
                                    draggable
                                    onDragStart={() => handleModuleDragStart(moduleIndex)}
                                    onDragOver={handleModuleDragOver}
                                    onDrop={() => handleModuleDrop(moduleIndex)}
                                    className={cn("border rounded-lg bg-muted/50", `transition-opacity ${draggedModuleIndex === moduleIndex ? 'opacity-50' : 'opacity-100'}`)}
                                >
                                    <ModuleItem
                                        moduleIndex={moduleIndex} 
                                        control={form.control}
                                        removeModule={removeModule}
                                        moveModule={moveModule}
                                        isFirst={moduleIndex === 0}
                                        isLast={moduleIndex === moduleFields.length - 1}
                                    />
                                </div>
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
                    <CardDescription>List the key skills students will gain. Drag to reorder or use arrows.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {featureFields.map((field, index) => (
                        <div
                            key={field.id}
                            className={`flex items-center gap-2 transition-opacity ${draggedFeatureIndex === index ? 'opacity-50' : 'opacity-100'}`}
                            draggable
                            onDragStart={() => handleFeatureDragStart(index)}
                            onDragOver={handleFeatureDragOver}
                            onDrop={() => handleFeatureDrop(index)}
                        >
                            <Button type="button" variant="ghost" size="icon" className="cursor-grab hidden md:flex">
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
                            <div className="flex flex-col">
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0} onClick={() => moveFeature(index, index - 1)}>
                                    <ArrowUp className="h-4 w-4" />
                                    <span className="sr-only">Move Up</span>
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={index === featureFields.length - 1} onClick={() => moveFeature(index, index + 1)}>
                                    <ArrowDown className="h-4 w-4" />
                                    <span className="sr-only">Move Down</span>
                                </Button>
                            </div>
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

function ModuleItem({ 
    moduleIndex, 
    control, 
    removeModule,
    moveModule,
    isFirst,
    isLast 
}: { 
    moduleIndex: number, 
    control: any, 
    removeModule: (index: number) => void,
    moveModule: (from: number, to: number) => void,
    isFirst: boolean,
    isLast: boolean
}) {
    const { fields: lessonFields, append: appendLesson, remove: removeLesson, move: moveLesson } = useFieldArray({
        control,
        name: `modules.${moduleIndex}.lessons`,
    });
    const [draggedLessonIndex, setDraggedLessonIndex] = React.useState<number | null>(null);

    const handleLessonDragStart = (index: number) => {
        setDraggedLessonIndex(index);
    };

    const handleLessonDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleLessonDrop = (index: number) => {
        if (draggedLessonIndex === null) return;
        moveLesson(draggedLessonIndex, index);
        setDraggedLessonIndex(null);
    };

    return (
        <AccordionItem value={`module-${moduleIndex}`} className="border-none">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2 flex-grow">
                    <Button type="button" variant="ghost" size="icon" className="cursor-grab hidden md:flex">
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
                    <div className="flex flex-col">
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={isFirst} onClick={() => moveModule(moduleIndex, moduleIndex - 1)}>
                            <ArrowUp className="h-4 w-4" />
                            <span className="sr-only">Move Module Up</span>
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={isLast} onClick={() => moveModule(moduleIndex, moduleIndex + 1)}>
                            <ArrowDown className="h-4 w-4" />
                            <span className="sr-only">Move Module Down</span>
                        </Button>
                    </div>
                    <AccordionTrigger className="p-2"/>
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeModule(moduleIndex)}>
                        <Trash />
                    </Button>
                </div>
            </div>
            <AccordionContent className="pt-0 pb-4 pl-12 pr-4 space-y-4">
                 {lessonFields.map((lesson, lessonIndex) => (
                    <div 
                        key={lesson.id} 
                        className={`flex items-start gap-2 transition-opacity ${draggedLessonIndex === lessonIndex ? 'opacity-50' : 'opacity-100'}`}
                        draggable
                        onDragStart={() => handleLessonDragStart(lessonIndex)}
                        onDragOver={handleLessonDragOver}
                        onDrop={() => handleLessonDrop(lessonIndex)}
                    >
                        <Button type="button" variant="ghost" size="icon" className="cursor-grab hidden md:flex mt-1">
                            <GripVertical className="w-5 h-5"/>
                        </Button>
                        <div className="flex-grow space-y-2">
                            <FormField
                                control={control}
                                name={`modules.${moduleIndex}.lessons.${lessonIndex}.title`}
                                render={({ field }) => (
                                <FormItem>
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
                        </div>
                        <div className="flex flex-col mt-1">
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={lessonIndex === 0} onClick={() => moveLesson(lessonIndex, lessonIndex - 1)}>
                                <ArrowUp className="h-4 w-4" />
                                <span className="sr-only">Move Lesson Up</span>
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={lessonIndex === lessonFields.length - 1} onClick={() => moveLesson(lessonIndex, lessonIndex + 1)}>
                                <ArrowDown className="h-4 w-4" />
                                <span className="sr-only">Move Lesson Down</span>
                            </Button>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive mt-1" onClick={() => removeLesson(lessonIndex)}>
                            <Trash className="w-4 h-4"/>
                            <span className="sr-only">Remove Lesson</span>
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
