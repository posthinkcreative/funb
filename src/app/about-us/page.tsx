'use client';

import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface WebsiteSetting {
  aboutUsTitle?: string;
  aboutUsContent?: string;
  aboutUsImages?: string[];
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
    const images = settings?.aboutUsImages || [];

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    <Skeleton className="h-12 w-1/2 mx-auto mb-8" />
                    <div className="space-y-4 text-left mb-12">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <Skeleton className="aspect-square w-full rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold font-headline mb-12 text-center text-accent">
                    {title}
                </h1>
                
                <div className="prose prose-lg max-w-none text-muted-foreground whitespace-pre-line leading-relaxed mb-16">
                    {content}
                </div>

                {images.length > 0 && (
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold font-headline text-center mb-8">Our Gallery</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {images.map((url, index) => (
                                <div 
                                    key={index} 
                                    className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group bg-muted border border-border/50"
                                >
                                    <Image 
                                        src={url} 
                                        alt={`About us ${index + 1}`}
                                        fill
                                        className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                                        unoptimized
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
