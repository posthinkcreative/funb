
'use client';

import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface WebsiteSetting {
  aboutUsTitle?: string;
  aboutUsContent?: string;
}

const SETTINGS_DOC_ID = 'main';

export default function AboutUsPage() {
    const firestore = useFirestore();

    const settingsDocRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'website_settings', SETTINGS_DOC_ID);
    }, [firestore]);

    const { data: settings, isLoading } = useDoc<WebsiteSetting>(settingsDocRef);
    
    const title = settings?.aboutUsTitle || "About Us";
    const content = settings?.aboutUsContent || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto text-center">
                    <Skeleton className="h-12 w-1/2 mx-auto mb-8" />
                    <div className="space-y-4 text-left">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold font-headline mb-12 text-center text-accent">
                    {title}
                </h1>
                {/* 
                  Using whitespace-pre-line to respect new lines from the admin panel
                  Using prose class for professional typography
                */}
                <div className="prose prose-lg max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
                    {content}
                </div>
            </div>
        </div>
    );
}
