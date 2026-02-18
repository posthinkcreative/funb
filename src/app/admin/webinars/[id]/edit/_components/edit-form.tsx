

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"
import React, { useRef, useState, useEffect } from "react"
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
import { Course, Speaker, Instructor } from "@/types"
import { Trash, GripVertical, PlusCircle, ArrowUp, ArrowDown, UploadCloud, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DatePicker } from "@/components/ui/datepicker"
import { useToast } from "@/hooks/use-toast"
import { courseFormSchema } from "@/lib/config"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useFirestore, useStorage, useUser, useCollection, useMemoFirebase } from "@/firebase"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { doc, updateDoc, collection } from "firebase/firestore"

const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

const parseDuration = (duration: string) => {
    if (!duration) return { hours: 0, minutes: 0 };
    let hours = 0;
    let minutes = 0;
    const hourMatch = duration.match(/(\d+)\s*hr|jam/);
    if (hourMatch) hours = parseInt(hourMatch[1], 10);
    const minMatch = duration.match(/(\d+)\s*min|menit/);
    if (minMatch) minutes = parseInt(minMatch[1], 10);
    return { hours, minutes };
}

interface EditWebinarFormProps {
  course: Course;
}

export function EditWebinarForm({ course }: EditWebinarFormProps) {
  const [draggedFeatureIndex, setDraggedFeatureIndex] = React.useState<number | null>(null);
  const [draggedModuleIndex, setDraggedModuleIndex] = React.useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = React.useState(false);
  const firestore = useFirestore();
  const storage = useStorage();
  const { user } = useUser();

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const practitionersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'practitioners');
  }, [firestore]);

  const { data: practitioners, isLoading: isLoadingPractitioners } = useCollection<Speaker>(practitionersQuery);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course.title,
      slug: course.slug,
      description: course.description,
      price: course.price,
      discountType: course.discountType || 'none',
      discountValue: course.discountValue || 0,
      category: course.category,
      instructorId: course.instructorId || "",
      newInstructorName: "",
      newInstructorTitle: "",
      imageUrl: course.imageUrl,
      videoUrl: course.videoUrl || "",
      courseDate: course.courseDate ? (typeof (course.courseDate as any).toDate === 'function' ? (course.courseDate as any).toDate() : new Date(course.courseDate)) : undefined,
      courseTime: course.courseTime || "",
      level: course.level || "Beginner",
      schedule: course.schedule || "Flexible",
      status: course.status,
      features: course.features.map(feature => ({ value: feature })),
      modules: course.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => {
            const { hours, minutes } = parseDuration(lesson.duration);
            return { id: lesson.id, title: lesson.title, durationHours: hours, durationMinutes: minutes }
        })
      })),
    },
  })

  const { fields: featureFields, append: appendFeature, remove: removeFeature, move: moveFeature } = useFieldArray({ control: form.control, name: "features" });
  const { fields: moduleFields, append: appendModule, remove: removeModule, move: moveModule } = useFieldArray({ control: form.control, name: "modules" });

  const handleSave = (status: "Published" | "Draft") => async (values: z.infer<typeof courseFormSchema>) => {
    setIsSubmitting(true);
    try {
        if (!user || !firestore || !storage || !practitioners) {
            toast({ title: "Authentication Error", description: "You must be logged in to perform this action.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        let instructorData: Instructor;
        if (values.newInstructorName) {
            instructorData = {
                id: `manual-${generateSlug(values.newInstructorName)}`,
                name: values.newInstructorName,
                title: values.newInstructorTitle || 'Instructor',
                bio: '',
                avatarUrl: 'https://placehold.co/100x100.png',
            };
        } else if (values.instructorId) {
            const selectedInstructor = practitioners.find(p => p.id === values.instructorId);
            if (!selectedInstructor) {
                toast({ title: "Instructor Not Found", description: "The selected instructor is invalid.", variant: "destructive" });
                setIsSubmitting(false);
                return;
            }
            instructorData = {
                id: selectedInstructor.id,
                name: selectedInstructor.name,
                title: selectedInstructor.title,
                bio: '',
                avatarUrl: selectedInstructor.imageUrl,
            };
        } else {
             toast({ title: "Instructor Required", description: "Please select an instructor or add a new one.", variant: "destructive" });
             setIsSubmitting(false);
             return;
        }
        
        let imageUrl = values.imageUrl;
        let videoUrl = values.videoUrl;

        if (newImageFile) {
            await user.getIdToken(true); 
            setIsUploadingImage(true);
            const sanitizedImageName = newImageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const imagePath = `hero-images/webinar-images/${course.id}/${sanitizedImageName}`;
            const imageRef = ref(storage, imagePath);
            await uploadBytes(imageRef, newImageFile);
            imageUrl = await getDownloadURL(imageRef);
            setIsUploadingImage(false);
        }

        if (newVideoFile) {
            await user.getIdToken(true);
            setIsUploadingVideo(true);
            const sanitizedVideoName = newVideoFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const videoPath = `hero-images/webinar-videos/${course.id}/${sanitizedVideoName}`;
            const videoRef = ref(storage, videoPath);
            await uploadBytes(videoRef, newVideoFile);
            videoUrl = await getDownloadURL(videoRef);
            setIsUploadingVideo(false);
        }
        
        const processedModules = values.modules.map(m => ({
            id: m.id,
            title: m.title,
            lessons: m.lessons.map(l => {
                const { durationHours, durationMinutes } = l;
                let durationString = '';
                if (durationHours && durationHours > 0) durationString += `${durationHours}hr `;
                if (durationMinutes && durationMinutes > 0) durationString += `${durationMinutes}min`;
                return { id: l.id, title: l.title, duration: durationString.trim() || '0min' };
            }),
        }));
        
        const dataToUpdate: any = {
            ...values,
            slug: course.slug, // Slug is immutable
            status,
            imageUrl,
            videoUrl,
            price: Number(values.price),
            discountType: values.discountType,
            discountValue: values.discountType !== 'none' ? Number(values.discountValue) : 0,
            features: values.features.map(f => f.value),
            modules: processedModules,
            longDescription: values.description, 
            instructorId: instructorData.id,
            instructor: instructorData,
        };

        delete dataToUpdate.newInstructorName;
        delete dataToUpdate.newInstructorTitle;

        const courseRef = doc(firestore, 'webinars', course.id);
        await updateDoc(courseRef, dataToUpdate);

        toast({ title: `Webinar ${status === 'Published' ? 'Published' : 'Saved as Draft'}`, description: `The webinar "${values.title}" has been saved.` });
        router.push("/admin/webinars");
        router.refresh();

    } catch (error: any) {
        console.error("Failed to update webinar:", error);
        toast({ title: `Error`, description: error.message || "An unexpected error occurred.", variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
        setIsUploadingImage(false);
        setIsUploadingVideo(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const preview = URL.createObjectURL(file);
        if (type === 'image') {
          if (!file.type.startsWith('image/')) {
            toast({ title: 'Invalid File', description: 'Please select an image file.', variant: 'destructive'});
            return;
          }
          setNewImageFile(file);
          setImagePreviewUrl(preview);
          form.setValue('imageUrl', 'file-selected');
        } else {
          if (!file.type.startsWith('video/')) {
            toast({ title: 'Invalid File', description: 'Please select a video file.', variant: 'destructive'});
            return;
          }
          setNewVideoFile(file);
          setVideoPreviewUrl(preview);
          form.setValue('videoUrl', 'file-selected');
        }
      }
  };
  
  const handleFeatureDragStart = (index: number) => setDraggedFeatureIndex(index);
  const handleFeatureDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();
  const handleFeatureDrop = (index: number) => {
    if (draggedFeatureIndex === null) return;
    moveFeature(draggedFeatureIndex, index);
    setDraggedFeatureIndex(null);
  };
  const handleModuleDragStart = (index: number) => setDraggedModuleIndex(index);
  const handleModuleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();
  const handleModuleDrop = (index: number) => {
    if (draggedModuleIndex === null) return;
    moveModule(draggedModuleIndex, index);
    setDraggedModuleIndex(null);
  };

  const watchedImageUrl = form.watch("imageUrl");
  const watchedVideoUrl = form.watch("videoUrl");
  const totalLoading = isSubmitting || isUploadingImage || isUploadingVideo || isLoadingPractitioners;

  if (!isMounted) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card><CardHeader><Skeleton className="h-8 w-48" /></CardHeader><CardContent className="space-y-6"><Skeleton className="h-10 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-8 w-48" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <Card><CardHeader><Skeleton className="h-8 w-48" /></CardHeader><CardContent className="space-y-6"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
                     <Card><CardHeader><Skeleton className="h-8 w-48" /></CardHeader><CardContent className="space-y-6"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-8 w-48" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
                    <div className="space-y-2"><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div>
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
                <CardTitle>Webinar Details</CardTitle>
                <CardDescription>Update the title, description, and media for your webinar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g. The Complete Web Development Bootcamp" {...field} disabled={totalLoading} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl><Input {...field} disabled /></FormControl>
                      <FormDescription>The slug cannot be changed after creation.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g. Learn to build modern web applications..." className="resize-none" rows={4} {...field} disabled={totalLoading} /></FormControl><FormDescription>A short description of the webinar.</FormDescription><FormMessage /></FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition-colors" onClick={() => imageInputRef.current?.click()}>
                            <div className="flex flex-col items-center gap-2 text-muted-foreground"><UploadCloud className="w-10 h-10" /><p className="font-semibold">{newImageFile ? "File selected:" : "Click or drag file to upload"}</p><p className="text-sm">{newImageFile ? newImageFile.name : "Recommended: 1200x800px"}</p></div>
                            <Input ref={imageInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image')} disabled={totalLoading} />
                          </div>
                          {(imagePreviewUrl || watchedImageUrl) && <Image src={imagePreviewUrl || watchedImageUrl} alt="Image preview" width={240} height={160} className="rounded-md object-cover mx-auto" />}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video (Optional)</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition-colors" onClick={() => videoInputRef.current?.click()}>
                             <div className="flex flex-col items-center gap-2 text-muted-foreground"><UploadCloud className="w-10 h-10" /><p className="font-semibold">{newVideoFile ? "File selected:" : "Click or drag file to upload"}</p><p className="text-sm">{newVideoFile ? newVideoFile.name : "MP4, WebM"}</p></div>
                            <Input ref={videoInputRef} type="file" className="hidden" accept="video/*" onChange={(e) => handleFileSelect(e, 'video')} disabled={totalLoading} />
                          </div>
                          {(videoPreviewUrl || (watchedVideoUrl && watchedVideoUrl.trim() !== '' && watchedVideoUrl.trim() !== 'file-selected')) && <video src={videoPreviewUrl || watchedVideoUrl} controls className="w-full max-w-xs rounded-md mx-auto" />}
                        </div>
                      </FormControl>
                      <FormDescription>Optional preview video for the webinar.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Webinar Content</CardTitle><CardDescription>Organize your webinar into modules and lessons. Drag to reorder or use arrows.</CardDescription></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Accordion type="multiple" className="w-full" defaultValue={[`module-${moduleFields[0]?.id}`]}>
                            {moduleFields.map((module, moduleIndex) => (
                                <div key={module.id} draggable onDragStart={() => handleModuleDragStart(moduleIndex)} onDragOver={handleModuleDragOver} onDrop={() => handleModuleDrop(moduleIndex)} className={cn("border rounded-lg bg-muted/50", `transition-opacity ${draggedModuleIndex === moduleIndex ? 'opacity-50' : 'opacity-100'}`)}>
                                    <ModuleItem moduleIndex={moduleIndex} control={form.control} removeModule={removeModule} moveModule={moveModule} isFirst={moduleIndex === 0} isLast={moduleIndex === moduleFields.length - 1} />
                                </div>
                            ))}
                        </Accordion>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendModule({ id: `new-mod-${Date.now()}`, title: "", lessons: [] })}><PlusCircle className="mr-2 h-4 w-4" />Add Module</Button>
                    </div>
                </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price (IDR)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="e.g. 750.000"
                                        {...field}
                                        value={new Intl.NumberFormat('id-ID').format(field.value || 0)}
                                        onChange={(e) => {
                                            const numericValue = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0;
                                            field.onChange(numericValue);
                                        }}
                                        onFocus={(e) => {
                                            if (e.target.value === '0') {
                                                e.target.select();
                                            }
                                        }}
                                        disabled={totalLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="discountType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || 'none'} disabled={totalLoading}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                            <SelectItem value="nominal">Nominal (IDR)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {form.watch('discountType') && form.watch('discountType') !== 'none' && (
                            <FormField
                                control={form.control}
                                name="discountValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Value</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder={form.watch('discountType') === 'percentage' ? "10" : "100000"}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                                onFocus={(e) => e.target.select()}
                                                disabled={totalLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                    <div className="space-y-2">
                        <FormLabel>Select Instructor</FormLabel>
                        <div className="flex items-center gap-2">
                            <FormField
                            control={form.control}
                            name="instructorId"
                            render={({ field }) => (
                                <FormItem className="flex-grow">
                                <Select onValueChange={field.onChange} value={field.value || ""} disabled={totalLoading}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingPractitioners ? "Loading..." : "Select an existing instructor"} />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {practitioners?.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            {form.watch('instructorId') && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0"
                                onClick={() => form.setValue('instructorId', '', { shouldValidate: true })}
                                disabled={totalLoading}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Clear selection</span>
                            </Button>
                            )}
                        </div>
                    </div>
                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                    </div>
                    <FormField
                        control={form.control}
                        name="newInstructorName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Add New Instructor Name</FormLabel>
                                <FormControl><Input placeholder="e.g. Bunga Citra" {...field} disabled={totalLoading} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="newInstructorTitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Instructor Title</FormLabel>
                                <FormControl><Input placeholder="e.g. Lead UX Designer" {...field} disabled={totalLoading} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={totalLoading}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Development">Development</SelectItem><SelectItem value="Design">Design</SelectItem><SelectItem value="Business">Business</SelectItem><SelectItem value="Marketing">Marketing</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="level" render={({ field }) => (<FormItem><FormLabel>Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={totalLoading}><FormControl><SelectTrigger><SelectValue placeholder="Select a level" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="schedule" render={({ field }) => (<FormItem><FormLabel>Schedule</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={totalLoading}><FormControl><SelectTrigger><SelectValue placeholder="Select a schedule type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Flexible">Flexible</SelectItem><SelectItem value="Fixed">Fixed</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle>Webinar Schedule</CardTitle><CardDescription>Set the date and time for the webinar.</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                 <FormField control={form.control} name="courseDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date</FormLabel><DatePicker value={field.value} onSelect={field.onChange} className="w-full" /><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="courseTime" render={({ field }) => (<FormItem><FormLabel>Time</FormLabel><FormControl><Input type="time" {...field} disabled={totalLoading} /></FormControl><FormMessage /></FormItem>)} />
              </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>What You'll Learn</CardTitle><CardDescription>List key skills. Drag to reorder.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    {featureFields.map((field, index) => (
                        <div key={field.id} className={`flex items-center gap-2 transition-opacity ${draggedFeatureIndex === index ? 'opacity-50' : 'opacity-100'}`} draggable onDragStart={() => handleFeatureDragStart(index)} onDragOver={handleFeatureDragOver} onDrop={() => handleFeatureDrop(index)}>
                            <Button type="button" variant="ghost" size="icon" className="cursor-grab hidden md:flex"><GripVertical /><span className="sr-only">Drag</span></Button>
                            <FormField control={form.control} name={`features.${index}.value`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder={`e.g. Master modern web development`} {...field} disabled={totalLoading} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex flex-col">
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0} onClick={() => moveFeature(index, index - 1)}><ArrowUp className="h-4 w-4" /><span className="sr-only">Up</span></Button>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={index === featureFields.length - 1} onClick={() => moveFeature(index, index + 1)}><ArrowDown className="h-4 w-4" /><span className="sr-only">Down</span></Button>
                            </div>
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeFeature(index)}><Trash /><span className="sr-only">Remove</span></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendFeature({ value: "" })}><PlusCircle className="mr-2 h-4 w-4" />Add Feature</Button>
                </CardContent>
            </Card>

            <div className="space-y-2">
              <Button onClick={form.handleSubmit(handleSave("Published"))} size="lg" className="w-full" disabled={totalLoading}>
                {isSubmitting ? 'Publishing...' : 'Publish'}
              </Button>
              <Button onClick={form.handleSubmit(handleSave("Draft"))} size="lg" variant="outline" className="w-full" disabled={totalLoading}>
                {isSubmitting ? 'Saving...' : 'Save as Draft'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}

function ModuleItem({ moduleIndex, control, removeModule, moveModule, isFirst, isLast }: { moduleIndex: number, control: any, removeModule: (index: number) => void, moveModule: (from: number, to: number) => void, isFirst: boolean, isLast: boolean }) {
    const { fields: lessonFields, append: appendLesson, remove: removeLesson, move: moveLesson } = useFieldArray({ control, name: `modules.${moduleIndex}.lessons` });
    const [draggedLessonIndex, setDraggedLessonIndex] = React.useState<number | null>(null);
    const handleLessonDragStart = (index: number) => setDraggedLessonIndex(index);
    const handleLessonDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();
    const handleLessonDrop = (index: number) => {
        if (draggedLessonIndex === null) return;
        moveLesson(draggedLessonIndex, index);
        setDraggedLessonIndex(null);
    };

    return (
        <AccordionItem value={`module-${moduleIndex}`} className="border-none">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2 flex-grow">
                    <Button type="button" variant="ghost" size="icon" className="cursor-grab hidden md:flex"><GripVertical /></Button>
                    <FormField control={control} name={`modules.${moduleIndex}.title`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder="Module Title" {...field} className="font-semibold bg-transparent border-0 shadow-none focus-visible:ring-0"/></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={isFirst} onClick={() => moveModule(moduleIndex, moduleIndex - 1)}><ArrowUp className="h-4 w-4" /></Button>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={isLast} onClick={() => moveModule(moduleIndex, moduleIndex + 1)}><ArrowDown className="h-4 w-4" /></Button>
                    </div>
                    <AccordionTrigger className="p-2"/>
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeModule(moduleIndex)}><Trash /></Button>
                </div>
            </div>
            <AccordionContent className="pt-0 pb-4 pl-12 pr-4 space-y-4">
                 {lessonFields.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className={`flex items-start gap-2 transition-opacity ${draggedLessonIndex === lessonIndex ? 'opacity-50' : 'opacity-100'}`} draggable onDragStart={() => handleLessonDragStart(lessonIndex)} onDragOver={handleLessonDragOver} onDrop={() => handleLessonDrop(lessonIndex)}>
                        <Button type="button" variant="ghost" size="icon" className="cursor-grab hidden md:flex mt-1"><GripVertical className="w-5 h-5"/></Button>
                        <div className="flex-grow space-y-2">
                            <FormField control={control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.title`} render={({ field }) => (<FormItem><FormControl><Input placeholder="Lesson Title" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-start gap-2">
                                <FormField control={control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.durationHours`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Hours</FormLabel><FormControl><Input type="number" placeholder="0" {...field} className="w-20"/></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.durationMinutes`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Minutes</FormLabel><FormControl><Input type="number" placeholder="0" {...field} className="w-20"/></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </div>
                        <div className="flex flex-col mt-1">
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={lessonIndex === 0} onClick={() => moveLesson(lessonIndex, lessonIndex - 1)}><ArrowUp className="h-4 w-4" /></Button>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={lessonIndex === lessonFields.length - 1} onClick={() => moveLesson(lessonIndex, lessonIndex + 1)}><ArrowDown className="h-4 w-4" /></Button>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive mt-1" onClick={() => removeLesson(lessonIndex)}><Trash className="w-4 h-4"/></Button>
                    </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => appendLesson({ id: `new-lesson-${Date.now()}`, title: "", durationHours: 0, durationMinutes: 10 })}><PlusCircle className="mr-2 h-4 w-4" />Add Lesson</Button>
            </AccordionContent>
        </AccordionItem>
    );
}
