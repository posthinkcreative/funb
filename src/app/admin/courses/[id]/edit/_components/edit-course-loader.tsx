
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { Course } from '@/types';

const EditCourseForm = dynamic(() => import('./edit-form').then(mod => mod.EditCourseForm), {
  ssr: false,
  loading: () => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <CardSkeleton />
                <CardSkeleton height="200px" />
            </div>
            <div className="lg:col-span-1 space-y-8">
                <CardSkeleton height="220px" />
                <CardSkeleton height="150px" />
                <CardSkeleton height="200px" />
                <div className="space-y-2">
                    <Skeleton className="h-11 w-full" />
                    <Skeleton className="h-11 w-full" />
                </div>
            </div>
        </div>
    </div>
  )
});

const CardSkeleton = ({ height = '150px' }: { height?: string }) => (
    <div className="p-6 border rounded-lg bg-background shadow-sm">
        <Skeleton className="h-7 w-1/3 mb-4" />
        <div style={{ height }} className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
);

interface EditCourseLoaderProps {
  course: Course;
}

export function EditCourseLoader({ course }: EditCourseLoaderProps) {
  // This component is now a client component, and it handles the dynamic import.
  // It receives the server-fetched course data as props.
  return <EditCourseForm course={course} />;
}
