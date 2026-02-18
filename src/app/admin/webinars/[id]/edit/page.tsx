
'use client';

import { notFound, useParams } from 'next/navigation';
import type { Course } from '@/types';
import React from 'react';
import { EditWebinarLoader } from './_components/edit-webinar-loader';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

// This is the Page, a Client Component now.
// It fetches the course data using a hook.
export default function EditWebinarPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const firestore = useFirestore();

  const courseDocRef = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    return doc(firestore, 'webinars', slug);
  }, [firestore, slug]);

  const { data: course, isLoading } = useDoc<Course>(courseDocRef);

  if (isLoading) {
    return (
        <div className="p-4 md:p-8">
            <div className="mb-6">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>
            {/* You can use the loading component from EditWebinarLoader for consistency */}
            <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="h-64 w-full rounded-lg" />
                        <Skeleton className="h-80 w-full rounded-lg" />
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <Skeleton className="h-64 w-full rounded-lg" />
                        <Skeleton className="h-40 w-full rounded-lg" />
                        <Skeleton className="h-56 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
  }

  if (!course) {
    return notFound();
  }

  // It then renders the loader component (which is also a Client Component)
  // and passes the server-fetched data to it.
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-headline">Edit Webinar</h2>
        <p className="text-muted-foreground">Modify the details for the webinar "{course.title}"</p>
      </div>
      <EditWebinarLoader course={course} />
    </div>
  );
}
