'use client';

import { notFound } from 'next/navigation';
import { WebinarContent } from './_components/webinar-content';
import type { Course } from '@/types';
import React from 'react';
import { useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { collection, query, where, limit, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

// Main Page Component
export default function WebinarPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;
  const firestore = useFirestore();

  // --- FETCH THE MAIN WEBINAR BY ITS DOCUMENT ID (which is the slug) ---
  const courseDocRef = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    // This is the correct way to get a document when its ID is known.
    return doc(firestore, 'webinars', slug);
  }, [firestore, slug]);

  const { data: course, isLoading: isLoadingCourse } = useDoc<Course>(courseDocRef);

  // --- FETCH RELATED COURSES (only after the main course is loaded) ---
  const relatedCoursesQuery = useMemoFirebase(() => {
    // IMPORTANT: Do not run this query until the main course and its category are known.
    if (!firestore || !course) return null;
    return query(
      collection(firestore, 'webinars'),
      where('category', '==', course.category),
      where('status', '==', 'Published'),
      limit(4) // Fetch 4, one might be the current course
    );
  }, [firestore, course]);
  
  const { data: relatedCoursesData } = useCollection<Course>(relatedCoursesQuery);

  const relatedCourses = React.useMemo(() => {
    if (!relatedCoursesData || !course) return [];
    // Filter out the current course from the related list.
    return relatedCoursesData.filter(c => c.id !== course.id).slice(0, 3);
  }, [relatedCoursesData, course]);

  // --- RENDER LOGIC ---

  // 1. While loading, show a skeleton UI.
  if (isLoadingCourse) {
    return (
        <div className="bg-background">
            <Skeleton className="h-[300px] md:h-[400px] w-full" />
            <div className="container mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <aside className="lg:sticky top-24 self-start">
                        <Skeleton className="h-[500px] w-full" />
                    </aside>
                </div>
            </div>
        </div>
    );
  }

  // 2. If loading is finished and the course is still null, it means the document was not found.
  // We should render the standard 404 page.
  if (!course) {
    notFound();
  }
  
  // 3. If the course is found but not published, it should also be treated as not found.
  if (course.status !== 'Published') {
    notFound();
  }
  
  // The enrollment count should come from the document to be efficient.
  const enrollmentCount = course.enrollmentCount || 0;

  // 4. Render the main content if everything is successful.
  return <WebinarContent course={course} relatedCourses={relatedCourses} enrollmentCount={enrollmentCount} />;
}
