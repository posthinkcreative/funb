
import { notFound } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import type { Course } from '@/types';
import React from 'react';
import { EditCourseLoader } from './_components/edit-course-loader';

function getCourse(id: string): Course | undefined {
    return courses.find(c => c.id === id);
}

// This is the Page, a Server Component.
// It fetches the course data.
export default function EditCoursePage({ params }: { params: { id: string } }) {
  // Note: In Next.js 13+ with App Router, params are passed directly, not as a promise.
  // Using React.use(params) is for suspense, but here we can just destructure.
  const { id } = params;
  const course = getCourse(id);

  if (!course) {
    notFound();
  }

  // It then renders the loader component (which is a Client Component)
  // and passes the server-fetched data to it.
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-headline">Edit Course</h2>
        <p className="text-muted-foreground">Modify the details for the course "{course.title}"</p>
      </div>
      <EditCourseLoader course={course} />
    </div>
  );
}
