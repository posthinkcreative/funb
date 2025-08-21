
'use client';

import * as React from 'react';
import Autoplay from "embla-carousel-autoplay"
import { speakers } from '@/lib/mock-data';
import { SpeakerCard } from './speaker-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function SpeakersSection() {
    const plugin = React.useRef(
        Autoplay({ delay: 2000, stopOnInteraction: true, stopOnMouseEnter: true })
    )
    
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12 text-accent max-w-4xl mx-auto">
          Engage in Live Lessons with Top Practitioners from Industry-leading Companies
        </h2>

        <Carousel
          plugins={[plugin.current]}
          opts={{
            align: 'start',
            loop: true,
          }}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.play}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {speakers.map((speaker) => (
              <CarouselItem key={speaker.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 flex">
                  <SpeakerCard speaker={speaker} />
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
