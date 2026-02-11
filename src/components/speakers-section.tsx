'use client';

import * as React from 'react';
import Autoplay from "embla-carousel-autoplay"
import { SpeakerCard } from './speaker-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Speaker } from '@/types';
import { Skeleton } from './ui/skeleton';

interface WebsiteSetting {
  practitionersTitle?: string;
}

const SETTINGS_DOC_ID = 'main';

export function SpeakersSection() {
    const plugin = React.useRef(
        Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
    )

    const firestore = useFirestore();
    const practitionersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'practitioners'), orderBy('sortOrder', 'asc'));
    }, [firestore]);

    const settingsDocRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'website_settings', SETTINGS_DOC_ID);
    }, [firestore]);

    const { data: speakers, isLoading: isLoadingSpeakers } = useCollection<Speaker>(practitionersQuery);
    const { data: settings, isLoading: isLoadingSettings } = useDoc<WebsiteSetting>(settingsDocRef);
    
    const isLoading = isLoadingSpeakers || isLoadingSettings;
    const title = settings?.practitionersTitle || "Engage in Live Lessons with Top Practitioners from Industry-leading Companies";
    
    const carouselThreshold = 4;

    const renderContent = () => {
        if (isLoading) {
             return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i}>
                            <Skeleton className="h-[400px] w-full" />
                        </div>
                    ))}
                </div>
            );
        }

        if (!speakers || speakers.length === 0) {
            return null;
        }

        if (speakers.length > carouselThreshold) {
            return (
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
                    <CarouselContent className="-ml-6">
                        {speakers.map((speaker) => (
                            <CarouselItem key={speaker.id} className="pl-6 basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <SpeakerCard speaker={speaker} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            );
        } else {
            return (
                <div className="flex justify-center -mx-3">
                    {speakers.map((speaker) => (
                       <div key={speaker.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4 px-3 flex">
                         <SpeakerCard speaker={speaker} />
                       </div>
                    ))}
                </div>
            );
        }
    };


  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {isLoading ? (
          <Skeleton className="h-10 w-3/4 mx-auto mb-12" />
        ) : (
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12 text-accent max-w-4xl mx-auto">
            {title}
          </h2>
        )}
        {renderContent()}
      </div>
    </section>
  );
}
