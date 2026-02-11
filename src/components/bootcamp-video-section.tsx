'use client';

import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import React from 'react';
import { BootcampVideo } from "@/components/bootcamp-video";
import { Skeleton } from './ui/skeleton';

interface WebsiteSetting {
  bootcampVideoUrl: string;
  bootcampTitle?: string;
  bootcampSubtitle?: string;
}

const SETTINGS_DOC_ID = 'main';
const FALLBACK_VIDEO_URL = "https://firebasestorage.googleapis.com/v0/b/aplikasi-web-32907.firebasestorage.app/o/HIGHLIGHT%20funb%203RD%20landscape.mp4?alt=media&token=d4b5c9d9-8eb7-4a0f-bcae-112acd1809eb";


export function BootcampVideoSection() {
    const firestore = useFirestore();

    const settingsDocRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'website_settings', SETTINGS_DOC_ID);
    }, [firestore]);

    const { data: settings, isLoading } = useDoc<WebsiteSetting>(settingsDocRef);
    
    const videoUrl = settings?.bootcampVideoUrl || FALLBACK_VIDEO_URL;
    const title = settings?.bootcampTitle || "FUN-B 3rd Bootcamp 2025";
    const subtitle = settings?.bootcampSubtitle || '"Scale & Grow Your Soul Of Beautypreneur"';


    return (
        <section className="py-12 text-center bg-background">
            <div className="container mx-auto px-4">
            {isLoading ? (
                <>
                    <Skeleton className="h-10 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-8 w-1/2 mx-auto mb-8" />
                </>
            ) : (
                <>
                    <h2 className="text-3xl md:text-4xl font-bold font-headline text-accent">
                        {title}
                    </h2>
                    <p className="text-xl md:text-2xl font-headline text-muted-foreground mt-2 mb-8">
                        {subtitle}
                    </p>
                </>
            )}
            <div className="max-w-4xl mx-auto">
                {isLoading ? (
                    <Skeleton className="w-full aspect-video rounded-lg" />
                ) : (
                    <BootcampVideo src={videoUrl} />
                )}
            </div>
            </div>
      </section>
    )
}
