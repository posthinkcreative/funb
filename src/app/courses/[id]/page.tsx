'use client';

import { notFound, useParams } from 'next/navigation';
import { CourseContent } from './_components/course-content';
import type { Course } from '@/types';
import React from 'react';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function CoursePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const firestore = useFirestore();

  const courseDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'courses', id);
  }, [firestore, id]);

  const { data: course, isLoading: isLoadingCourse } = useDoc<Course>(courseDocRef);

  const relatedCoursesQuery = useMemoFirebase(() => {
    if (!firestore || !course) return null;
    return query(
      collection(firestore, 'courses'),
      where('category', '==', course.category),
      where('status', '==', 'Published'),
      limit(4) // Fetch 4, one might be the current course
    );
  }, [firestore, course]);
  
  const { data: relatedCoursesData, isLoading: isLoadingRelated } = useCollection<Course>(relatedCoursesQuery);

  const relatedCourses = React.useMemo(() => {
    if (!relatedCoursesData || !course) return [];
    return relatedCoursesData.filter(c => c.id !== course.id).slice(0, 3);
  }, [relatedCoursesData, course]);
  
  const isLoading = isLoadingCourse || (course && isLoadingRelated);

  if (isLoading) {
    return ( // A skeleton loader for the detail page
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

  if (!course || course.status !== 'Published') {
    notFound();
  }

  return <CourseContent course={course} relatedCourses={relatedCourses} />;
}
