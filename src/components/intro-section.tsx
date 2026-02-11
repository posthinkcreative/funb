'use client';

import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import React from 'react';
import { Skeleton } from './ui/skeleton';

interface WebsiteSetting {
  introTitle?: string;
  introDescription?: string;
}

const SETTINGS_DOC_ID = 'main';

export function IntroSection() {
    const firestore = useFirestore();

    const settingsDocRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'website_settings', SETTINGS_DOC_ID);
    }, [firestore]);

    const { data: settings, isLoading } = useDoc<WebsiteSetting>(settingsDocRef);
    
    const title = settings?.introTitle || "Unlock Your Potential with FunB";
    const description = settings?.introDescription || "Our AI-powered platform provides personalized course recommendations to help you achieve your career goals. Explore a wide range of courses and start learning today.";

    if (isLoading) {
        return (
            <section className="py-12">
                <div className="container mx-auto px-4 text-center">
                    <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
                    <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
                    <Skeleton className="h-6 w-1/2 max-w-3xl mx-auto mt-2" />
                </div>
            </section>
        );
    }

    return (
        <section className="py-12">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-accent" style={{ whiteSpace: 'pre-line' }}>
                {title}
              </h1>
              <p className="max-w-3xl mx-auto text-muted-foreground md:text-xl" style={{ whiteSpace: 'pre-line' }}>
                {description}
              </p>
            </div>
      </section>
    )
}

    