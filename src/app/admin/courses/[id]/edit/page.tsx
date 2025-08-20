
import { notFound } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import { EditCourseForm } from './_components/edit-form';
import type { Course } from '@/types';
import React from 'react';

function getCourse(id: string): Course | undefined {
    return courses.find(c => c.id === id);
}

// This is the Page, a Server Component.
// It fetches the course data.
export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const course = getCourse(id);

  if (!course) {
    notFound();
  }

  // It then renders the form (which is a Client Component) and passes the data.
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-headline">Edit Course</h2>
        <p className="text-muted-foreground">Modify the details for the course "{course.title}"</p>
      </div>
      <EditCourseForm course={course} />
    </div>
  );
}
