'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star, Users, BarChart, Check, FileText, VolumeX, Volume2, Expand, Calendar, Clock } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CourseCard } from '@/components/course-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import React, { useState, useRef, useEffect } from 'react';
import { Course } from '@/types';
import { format } from 'date-fns';


interface CourseContentProps {
    course: Course;
    relatedCourses: Course[];
}


export function CourseContent({ course, relatedCourses }: CourseContentProps) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [displayPrice, setDisplayPrice] = React.useState({ original: '', final: '' });
  
  const courseDateObject = course.courseDate && typeof (course.courseDate as any).toDate === 'function' 
    ? (course.courseDate as any).toDate() 
    : course.courseDate ? new Date(course.courseDate) : null;


  useEffect(() => {
    const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

    if (course) {
        const { price, discountType, discountValue } = course;
        let finalPrice: number | null = null;
        if (discountType && discountType !== 'none' && discountValue && discountValue > 0) {
            if (discountType === 'percentage') {
                finalPrice = price * (1 - discountValue / 100);
            } else if (discountType === 'nominal') {
                finalPrice = price - discountValue;
            }
        }
        
        setDisplayPrice({
            original: formatCurrency(price),
            final: finalPrice !== null ? formatCurrency(finalPrice) : ''
        });
    }
  }, [course]);


  const toggleMute = () => {
    if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="bg-background">
      <section className="relative h-[300px] md:h-[400px] flex items-center justify-center text-white">
        <Image
          src={course.imageUrl}
          alt={course.title}
          fill
          style={{objectFit: 'cover'}}
          className="absolute inset-0 z-0"
          data-ai-hint="course hero background"
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 container mx-auto px-6 text-center">
          <Badge variant="secondary" className="mb-4">{course.category}</Badge>
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4">{course.title}</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-6">{course.description}</p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              <span>{course.rating} ({course.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-5 h-5" />
              <span>1,234 students</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <Card className="mb-8 shadow-lg">
              <CardHeader>
                <h2 className="text-2xl font-headline font-bold">What you'll learn</h2>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                {course.features.map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-1 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <h2 className="text-2xl font-headline font-bold mb-4">Webinar content</h2>
            <Accordion type="single" collapsible className="w-full bg-white rounded-lg border shadow-lg">
              {course.modules.map(module => (
                <AccordionItem value={module.id} key={module.id}>
                  <AccordionTrigger className="px-6 font-semibold hover:no-underline">{module.title}</AccordionTrigger>
                  <AccordionContent className="px-6">
                    <ul className='space-y-3'>
                      {module.lessons.map(lesson => (
                        <li key={lesson.id} className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4" />
                            <span>{lesson.title}</span>
                          </div>
                          <span>{lesson.duration}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Separator className="my-12" />

            <h2 className="text-2xl font-headline font-bold mb-4">Instructor</h2>
            <div className="bg-white p-6 rounded-lg border shadow-lg">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={course.instructor.avatarUrl} alt={course.instructor.name} />
                  <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold font-headline text-primary">{course.instructor.name}</h3>
                  <p className="text-muted-foreground">{course.instructor.title}</p>
                  <Link href={`/instructors/${course.instructor.id}`} className="text-sm text-primary hover:underline mt-1 inline-block">View Profile</Link>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{course.instructor.bio}</p>
            </div>

            <Separator className="my-12" />

            <h2 className="text-2xl font-headline font-bold mb-4">Student feedback</h2>
            <div className="space-y-6">
              {course.reviews.map(review => (
                <div key={review.id} className="bg-white p-6 rounded-lg border shadow-lg">
                  <div className="flex items-center gap-4 mb-2">
                    <Avatar>
                      <AvatarImage src={review.user.avatarUrl} alt={review.user.name} />
                      <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{review.user.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />)}
                        </div>
                        <span>{review.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:sticky top-24 self-start">
            <Card className="overflow-hidden shadow-xl">
               <Dialog>
                <div className="relative">
                    {course.videoUrl && course.videoUrl.trim() !== '' ? (
                        <video
                            ref={videoRef}
                            src={course.videoUrl}
                            className="w-full aspect-video object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                    ) : (
                        <Image src={course.imageUrl} data-ai-hint="online learning course" alt={course.title} width={600} height={400} className="w-full object-cover" />
                    )}
                    
                    <div className='absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/60 to-transparent'>
                        <h3 className='text-white font-bold text-lg'>Webinar Preview</h3>
                    </div>

                    {course.videoUrl && course.videoUrl.trim() !== '' && (
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                             <Button size="icon" variant="ghost" className="text-white hover:bg-black/50 hover:text-white" onClick={toggleMute}>
                                {isMuted ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}
                                <span className="sr-only">Toggle Volume</span>
                            </Button>
                            <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="text-white hover:bg-black/50 hover:text-white">
                                    <Expand className="w-5 h-5"/>
                                    <span className="sr-only">Fullscreen</span>
                                </Button>
                            </DialogTrigger>
                        </div>
                    )}
                </div>
                {course.videoUrl && course.videoUrl.trim() !== '' && (
                <DialogContent className="max-w-3xl p-0">
                    <DialogHeader>
                      <DialogTitle className="sr-only">{course.title} Video Preview</DialogTitle>
                    </DialogHeader>
                    <video src={course.videoUrl} className="w-full aspect-video rounded-lg" controls autoPlay />
                </DialogContent>
                )}
               </Dialog>
              <CardContent className="p-6">
                <div className="flex items-baseline gap-2 mb-4">
                    <h2 className="text-4xl font-bold">{displayPrice.final || displayPrice.original || '...'}</h2>
                    {displayPrice.final && (
                        <p className="text-2xl font-bold text-muted-foreground line-through">{displayPrice.original}</p>
                    )}
                </div>
                <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold" asChild>
                  <Link href={`/checkout/${course.id}`}>Register Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full mt-2">
                  Add to Cart
                </Button>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {courseDateObject && (
                    <li className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span>{format(courseDateObject, "dd MMMM yyyy")}</span>
                    </li>
                  )}
                  {course.courseTime && (
                    <li className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>Pukul {course.courseTime} WIB</span>
                    </li>
                  )}
                   {course.level && (
                    <li className="flex items-center gap-3">
                      <BarChart className="w-5 h-5 text-primary" />
                      <span>{course.level} Level</span>
                    </li>
                  )}
                  {course.schedule && (
                    <li className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <span>{course.schedule} schedule</span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>

        <Separator className="my-12" />

        <div>
          <h2 className="text-3xl font-bold font-headline mb-8 text-center">Related Webinars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCourses.map(relatedCourse => (
              <CourseCard key={relatedCourse.id} course={relatedCourse} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
