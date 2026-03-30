'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Check, FileText, VolumeX, Volume2, Expand, Calendar, Clock, Activity, X, CheckCircle2, PlayCircle, Lock, ExternalLink, MessageCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { WebinarCard } from '@/components/webinar-card';
import React, { useState, useRef, useEffect } from 'react';
import { Course } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


interface WebinarContentProps {
    course: Course;
    relatedCourses: Course[];
    enrollmentCount: number;
}


export function WebinarContent({ course, relatedCourses, enrollmentCount }: WebinarContentProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [displayPrice, setDisplayPrice] = React.useState({ original: '', final: '' });

  // Fetch user profile to check enrollment status
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<any>(userDocRef);
  
  const isEnrolled = userProfile?.enrolledCourseIds?.includes(course.id);
  
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

  // Effect to handle 'Escape' key to exit fullscreen
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    if (isFullscreen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isFullscreen]);

  // Effect to manage video controls and mute state when fullscreen is toggled
  useEffect(() => {
      if (videoRef.current) {
          if (isFullscreen) {
              // Entering fullscreen: unmute and show native controls
              videoRef.current.muted = false;
              setIsMuted(false);
              videoRef.current.controls = true;
          } else {
              // Exiting fullscreen: mute and hide native controls for preview
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.controls = false;
          }
      }
  }, [isFullscreen]);


  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from triggering other events
    if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className={cn("bg-secondary/50 min-h-screen flex flex-col", isFullscreen && "overflow-hidden h-screen bg-black")}>
      {!isFullscreen && (
        <section className="relative w-full aspect-video bg-black overflow-hidden flex-shrink-0">
          <Image
            src={course.imageUrl}
            alt={course.title}
            fill
            style={{objectFit: 'cover'}}
            className="absolute inset-0 z-0"
            data-ai-hint="course hero background"
            priority
          />
        </section>
      )}

      <div className={cn("container mx-auto px-6 py-12 flex-grow", isFullscreen && "p-0 m-0 w-full max-w-none h-full")}>
        <div className={cn("grid lg:grid-cols-3 gap-12", isFullscreen && "block h-full")}>
          
          <div className={cn("lg:col-span-2 space-y-8", isFullscreen && "hidden")}>
            
            {/* Exclusive Content Section */}
            {isEnrolled && (
              <Card className="border-primary/30 bg-primary/5 shadow-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                <CardHeader className="bg-primary/10 flex flex-row items-center gap-3 py-4">
                  <Lock className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle className="text-xl">Webinar Access Details</CardTitle>
                    <CardDescription>Welcome! Here are your exclusive access details.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {course.exclusiveContent?.zoomLink && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Webinar Link (Zoom/GMeet)</p>
                        <Button className="w-full justify-between" variant="outline" asChild>
                          <a href={course.exclusiveContent.zoomLink} target="_blank" rel="noopener noreferrer">
                            Join Live Session
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                      </div>
                    )}
                    {course.exclusiveContent?.whatsappLink && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Community Group</p>
                        <Button className="w-full justify-between bg-green-600 hover:bg-green-700 text-white" asChild>
                          <a href={course.exclusiveContent.whatsappLink} target="_blank" rel="noopener noreferrer">
                            Join WhatsApp Group
                            <MessageCircle className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                  {course.exclusiveContent?.additionalNotes && (
                    <div className="mt-6 p-4 rounded-lg bg-background border border-dashed">
                      <p className="text-sm font-semibold mb-2">Important Notes:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{course.exclusiveContent.additionalNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="shadow-xl bg-background">
              <CardHeader className="text-center pt-8">
                  <Badge variant="secondary" className="mb-4 w-fit mx-auto">{course.category}</Badge>
                  <h1 className="text-3xl md:text-5xl font-headline font-bold">{course.title}</h1>
              </CardHeader>
              <CardContent className="text-center">
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{course.description}</p>
              </CardContent>
            </Card>

            <div className="space-y-8 mt-8">
                <Card className="shadow-lg bg-background">
                <CardHeader>
                    <h2 className="text-2xl font-headline font-bold">What you will learn</h2>
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

                <h2 className="text-2xl font-headline font-bold pt-8">Webinar Content</h2>
                <Accordion type="single" collapsible className="w-full bg-background rounded-lg border shadow-lg">
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

                <h2 className="text-2xl font-headline font-bold">Instructor</h2>
                <div className="bg-background p-6 rounded-lg border shadow-lg">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                    <AvatarImage src={course.instructor.avatarUrl} alt={course.instructor.name} />
                    <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                    <h3 className="text-xl font-bold font-headline text-primary">{course.instructor.name}</h3>
                    <p className="text-sm text-muted-foreground">{course.instructor.title}</p>
                    </div>
                </div>
                </div>
            </div>
          </div>

          <aside className={cn(
            "lg:sticky top-8 self-start",
            isFullscreen && "fixed inset-0 z-[10000] bg-black m-0 p-0 w-full h-full flex items-center justify-center"
          )}>
            <Card className={cn(
              "overflow-hidden shadow-xl bg-background",
              isFullscreen && "rounded-none border-0 shadow-none bg-black w-full h-full flex items-center justify-center"
            )}>
              <div
                className={cn(
                  "relative w-full", 
                  isFullscreen ? "h-full flex items-center justify-center" : "aspect-video"
                )}
              >
                {course.videoUrl && course.videoUrl.trim() !== '' ? (
                    <video
                        ref={videoRef}
                        src={course.videoUrl}
                        className={cn(
                            "w-full object-cover",
                            isFullscreen ? "h-full max-h-screen object-contain" : "aspect-video"
                        )}
                        autoPlay
                        loop
                        muted 
                        playsInline
                    />
                ) : (
                    <div className={cn("relative aspect-video w-full overflow-hidden", isFullscreen && "h-full max-h-screen")}>
                        <Image src={course.imageUrl} data-ai-hint="online learning course" alt={course.title} fill className="object-cover" />
                    </div>
                )}
                
                {!isFullscreen && (
                  <div className='absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/60 to-transparent'>
                      <h3 className='text-white font-bold text-lg'>Webinar Preview</h3>
                  </div>
                )}

                {course.videoUrl && course.videoUrl.trim() !== '' && (
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    {!isFullscreen && (
                       <>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-black/50 hover:text-white" onClick={toggleMute}>
                            {isMuted ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}
                            <span className="sr-only">Toggle Volume</span>
                        </Button>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-black/50 hover:text-white" onClick={() => setIsFullscreen(true)}>
                            <Expand className="w-5 h-5"/>
                            <span className="sr-only">Fullscreen</span>
                        </Button>
                       </>
                    )}
                  </div>
                )}
                 {isFullscreen && (
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 hover:text-white absolute top-6 right-6 z-[10001] bg-black/40 rounded-full" onClick={() => setIsFullscreen(false)}>
                        <X className="w-8 h-8"/>
                        <span className="sr-only">Close Fullscreen</span>
                    </Button>
                )}
              </div>
              
              {!isFullscreen && (
                <CardContent className="p-6">
                    {isEnrolled ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>You are enrolled!</span>
                        </div>
                        <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold" asChild>
                          <Link href="/account/my-webinars">
                            <PlayCircle className="mr-2 h-5 w-5" />
                            My Learning Dashboard
                          </Link>
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          Exclusive access links are now visible on this page.
                        </p>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                    
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
                        <span>At {course.courseTime} WIB</span>
                        </li>
                    )}
                    {course.level && (
                        <li className="flex items-center gap-3">
                        <BarChart className="w-5 h-5 text-primary" />
                        <span>Level {course.level}</span>
                        </li>
                    )}
                    {course.schedule && (
                        <li className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-primary" />
                        <span>Schedule {course.schedule}</span>
                        </li>
                    )}
                    </ul>
                </CardContent>
              )}
            </Card>
          </aside>
        </div>

        {!isFullscreen && (
          <>
            <Separator className="my-12" />
            <div>
              <h2 className="text-3xl font-bold font-headline mb-8 text-center">Related Webinars</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedCourses.map(relatedCourse => (
                  <WebinarCard key={relatedCourse.id} course={relatedCourse} />
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
