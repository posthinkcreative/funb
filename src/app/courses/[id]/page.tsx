
import { notFound } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import { CourseContent } from './_components/course-content';
import type { Course } from '@/types';
import React from 'react';

function getCourse(id: string): Course | undefined {
    return courses.find(c => c.id === id);
}

function getRelatedCourses(currentCourse: Course): Course[] {
    return courses
        .filter(c => c.category === currentCourse.category && c.id !== currentCourse.id)
        .slice(0, 3); // Get up to 3 related courses
}

// This is the Page, a Server Component. 
// It fetches data and passes it to the CourseContent client component.
export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const course = getCourse(id);

  if (!course) {
    notFound();
  }

  const relatedCourses = getRelatedCourses(course);
  
  // Render the client component and pass the course data and related courses as props.
  return <CourseContent course={course} relatedCourses={relatedCourses} />;
}
