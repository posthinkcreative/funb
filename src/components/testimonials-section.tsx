'use client';

import * as React from 'react';
import Autoplay from "embla-carousel-autoplay"
import { AlumniCard } from './alumni-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { AlumniTestimonial } from '@/types';
import { Skeleton } from './ui/skeleton';


interface WebsiteSetting {
  testimonialsTitle?: string;
}

const SETTINGS_DOC_ID = 'main';


export function TestimonialsSection() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const firestore = useFirestore();
  const testimonialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'alumniTestimonials'), orderBy('sortOrder', 'asc'));
  }, [firestore]);

  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'website_settings', SETTINGS_DOC_ID);
  }, [firestore]);

  const { data: testimonials, isLoading: isLoadingTestimonials } = useCollection<AlumniTestimonial>(testimonialsQuery);
  const { data: settings, isLoading: isLoadingSettings } = useDoc<WebsiteSetting>(settingsDocRef);
  
  const isLoading = isLoadingTestimonials || isLoadingSettings;
  const title = settings?.testimonialsTitle || "Connect with Alumni Who've Walked Your Path!";

  const carouselThreshold = 4;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-1">
              <Skeleton className="h-[450px] w-full" />
            </div>
          ))}
        </div>
      );
    }

    if (!testimonials || testimonials.length === 0) {
      return null; // Or a placeholder message
    }

    if (testimonials.length > carouselThreshold) {
      return (
        <Carousel
          plugins={[plugin.current]}
          opts={{ align: 'start', loop: true }}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.play}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial) => (
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
      );
    } else {
      return (
        <div className="flex justify-center -mx-2">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/3 px-2 flex">
               <div className="p-1 w-full">
                  <AlumniCard testimonial={testimonial} />
                </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <section className="py-12 bg-secondary/50">
      <div className="container mx-auto px-4">
        {isLoading ? (
            <Skeleton className="h-10 w-3/4 mx-auto mb-12" />
        ) : (
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12 text-accent">
                {title}
            </h2>
        )}
        {renderContent()}
      </div>
    </section>
  );
}
