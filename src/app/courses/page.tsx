
import { CourseCard } from '@/components/course-card';
import { courses } from '@/lib/mock-data';
import type { Course } from '@/types';

export default function CoursesPage() {
  const filteredCourses: Course[] = courses;

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="w-full py-12 md:py-16 text-center bg-background">
        <div className="container px-4 md:px-6">
          <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl text-primary">
            All Courses
          </h1>
          <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
            Find the perfect course to boost your skills.
          </p>
        </div>
      </section>

      <section className="w-full py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
