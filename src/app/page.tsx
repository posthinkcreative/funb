

import { CourseCard } from "@/components/course-card";
import { CompanyLogos } from "@/components/company-logos";
import { HeroCarousel } from "@/components/hero-carousel";
import { courses } from "@/lib/mock-data";
import { BootcampVideo } from "@/components/bootcamp-video";
import { SpeakersSection } from "@/components/speakers-section";
import { InstagramFeed } from "@/components/instagram-feed";
import { TestimonialsSection } from "@/components/testimonials-section";

export default function Home() {
  const featuredCourses = courses;
  
  return (
    <>
      <HeroCarousel />
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-accent">
            Unlock Your Potential with FunB
          </h1>
          <p className="max-w-3xl mx-auto text-muted-foreground md:text-xl">
            Our AI-powered platform provides personalized course recommendations to help you achieve your career goals. Explore a wide range of courses and start learning today.
          </p>
        </div>
      </section>

      <CompanyLogos />

      <section className="py-16 text-center bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-accent">
            FUN-B 3rd Bootcamp 2025
          </h2>
          <p className="text-xl md:text-2xl font-headline text-muted-foreground mt-2 mb-8">
            "Scale & Grow Your Soul Of Beautypreneur"
          </p>
          <div className="max-w-4xl mx-auto">
            <BootcampVideo src="https://firebasestorage.googleapis.com/v0/b/aplikasi-web-32907.firebasestorage.app/o/HIGHLIGHT%20funb%203RD%20landscape.mp4?alt=media&token=d4b5c9d9-8eb7-4a0f-bcae-112acd1809eb" />
          </div>
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

      <SpeakersSection />

      <InstagramFeed />

      <TestimonialsSection />
    </>
  );
}
