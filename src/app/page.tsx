
import { CourseCard } from "@/components/course-card";
import { HeroCarousel } from "@/components/hero-carousel";
import { courses } from "@/lib/mock-data";

export default function Home() {
  const featuredCourses = courses;
  
  return (
    <>
      <HeroCarousel />
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-primary">
            Unlock Your Potential with FunB
          </h1>
          <p className="max-w-3xl mx-auto text-muted-foreground md:text-xl">
            Our AI-powered platform provides personalized course recommendations to help you achieve your career goals. Explore a wide range of courses and start learning today.
          </p>
        </div>
      </section>

      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-headline text-center mb-8">
            Explore Our Programs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
