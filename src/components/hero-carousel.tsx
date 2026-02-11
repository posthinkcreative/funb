'use client';

import * as React from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { useRouter } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { HeroCarouselItem as HeroCarouselItemType } from '@/types';

export function HeroCarousel() {
  const firestore = useFirestore();
  const router = useRouter();

  const heroItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'heroItems'), orderBy('sortOrder', 'asc'));
  }, [firestore]);

  const { data: heroItems, isLoading } = useCollection<HeroCarouselItemType>(heroItemsQuery);

  const [api, setApi] = React.useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  // The Autoplay plugin. It will start playing on init and stop on interaction.
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  React.useEffect(() => {
    if (!api) return;

    // Update the current slide index when it changes
    const onSelect = () => setCurrentSlide(api.selectedScrollSnap());
    api.on('select', onSelect);

    // When the component unmounts, destroy the carousel API
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const handleButtonClick = () => {
    const currentItem = heroItems?.[currentSlide];
    if (currentItem?.ctaLink) {
      router.push(currentItem.ctaLink);
    }
  };

  // --- Conditional Rendering ---
  // 1. Loading State
  if (isLoading) {
    return (
      <section className="w-full relative">
        <Skeleton className="w-full aspect-[16/9] md:aspect-video" />
      </section>
    );
  }

  // 2. Empty/Not Configured State
  if (!heroItems || heroItems.length === 0) {
    return (
      <section className="w-full relative bg-muted flex items-center justify-center aspect-[16/9] md:aspect-video">
        <div className="text-center">
            <h2 className="text-2xl font-bold font-headline">Hero Carousel Not Configured</h2>
            <p className="text-muted-foreground">Please add slides in the admin panel.</p>
        </div>
      </section>
    );
  }
  
  const currentItem = heroItems[currentSlide];

  // 3. Render the carousel only when data is valid and ready
  return (
    <section className="w-full relative">
      <Carousel
        setApi={setApi}
        // The Autoplay plugin is passed here. It will handle its own lifecycle.
        plugins={[autoplayPlugin.current]}
        className="w-full"
        // Loop is required for continuous play
        opts={{ loop: true }}
      >
        <CarouselContent className="ml-0">
          {heroItems.map((item, index) => (
            <CarouselItem key={item.id ?? index} className="pl-0 basis-full">
              <div className="relative w-full aspect-[16/9] md:aspect-video bg-black">
                <Image
                  src={item.imageUrl}
                  alt={item.title || `Hero Image ${index + 1}`}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {currentItem && (
        <div className="absolute bottom-6 left-6 z-10">
          <Button
            size="lg"
            onClick={handleButtonClick}
            className="bg-black hover:bg-gray-800 text-white"
          >
            {currentItem.ctaText || 'Explore'}
          </Button>
        </div>
      )}
    </section>
  );
}
