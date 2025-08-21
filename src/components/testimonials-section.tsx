
'use client';

import { alumniTestimonials } from '@/lib/mock-data';
import { AlumniCard } from './alumni-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12 text-accent">
          Connect with Alumni Who've Walked Your Path!
        </h2>

        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {alumniTestimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/3 flex">
                <div className="p-1 w-full">
                  <AlumniCard testimonial={testimonial} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex" />
          <CarouselNext className="hidden lg:flex" />
        </Carousel>
      </div>
    </section>
  );
}
