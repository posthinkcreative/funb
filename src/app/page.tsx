'use client';

import { WebinarCard } from "@/components/webinar-card";
import { SponsorLogos } from "@/components/company-logos";
import { HeroCarousel } from "@/components/hero-carousel";
import { BootcampVideoSection } from "@/components/bootcamp-video-section";
import { SpeakersSection } from "@/components/speakers-section";
import { InstagramFeed } from "@/components/instagram-feed";
import { TestimonialsSection } from "@/components/testimonials-section";
import { IntroSection } from "@/components/intro-section";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import type { Course } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const WebinarCardSkeleton = () => (
    <div className="flex flex-col h-full overflow-hidden transition-all duration-300 rounded-lg border">
        <Skeleton className="w-full h-48" />
        <div className="p-4 flex-grow">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="p-4 pt-0 flex justify-between items-center text-sm border-t mt-auto">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
        </div>
    </div>
);

export default function Home() {
  const firestore = useFirestore();

  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "courses"), where("status", "==", "Published"), orderBy("createdAt", "desc"), limit(6));
  }, [firestore]);

  const { data: featuredCourses, isLoading } = useCollection<Course>(coursesQuery);
  
  return (
    <>
      <HeroCarousel />
      <IntroSection />

      <SponsorLogos />

      <BootcampVideoSection />

      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-headline text-center mb-8">
            Explore Our Webinars
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
                <>
                    <WebinarCardSkeleton />
                    <WebinarCardSkeleton />
                    <WebinarCardSkeleton />
                </>
            ) : (
                featuredCourses && featuredCourses.map(course => (
                    <WebinarCard key={course.id} course={course} />
                ))
            )}
          </div>
        </div>
      </section>

      <SpeakersSection />

      <InstagramFeed />

      <TestimonialsSection />
    </>
  );
}
