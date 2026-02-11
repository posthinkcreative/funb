
"use client"

import React from "react"
import Image from "next/image"
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { SponsorLogo as SponsorLogoType } from '@/types';
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

export function SponsorLogos() {
  const firestore = useFirestore();
  const sponsorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sponsor_logos'), orderBy('sortOrder', 'asc'));
  }, [firestore]);

  const { data: sponsorLogos, isLoading } = useCollection<SponsorLogoType>(sponsorsQuery);

  if (isLoading) {
    return (
        <section className="py-12 bg-background">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-2xl font-bold text-accent mb-8 max-w-2xl mx-auto">
                    We are Proud to be Supported by Our Amazing Sponsors
                </h2>
                <div className="w-full flex justify-center gap-16 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-40 w-[200px]" />
                    ))}
                </div>
            </div>
        </section>
    )
  }
  
  if (!sponsorLogos || sponsorLogos.length === 0) {
    return null; // Don't render the section if there are no logos
  }
  
  // If there are more than 4 logos, they will scroll. Otherwise, they will be static.
  const LOGO_SCROLL_THRESHOLD = 4;
  const shouldScroll = sponsorLogos.length > LOGO_SCROLL_THRESHOLD;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-accent mb-8 max-w-2xl mx-auto">
          We are Proud to be Supported by Our Amazing Sponsors
        </h2>
        
        {shouldScroll ? (
          // SCROLLING: This version is for when you have many logos.
          <div
            className="w-full inline-flex flex-nowrap overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 animate-scroll">
              {sponsorLogos.map((sponsor) => (
                <li key={sponsor.id} className="relative h-40 w-52">
                  <Image
                    src={sponsor.imageUrl}
                    alt={`${sponsor.name} logo`}
                    fill
                    sizes="(max-width: 768px) 100vw, 208px"
                    className="object-contain"
                  />
                </li>
              ))}
            </ul>
            {/* This is the duplicated list that creates the seamless loop */}
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 animate-scroll" aria-hidden="true">
               {sponsorLogos.map((sponsor) => (
                <li key={`${sponsor.id}-duplicate`} className="relative h-40 w-52">
                  <Image
                    src={sponsor.imageUrl}
                    alt={`${sponsor.name} logo`}
                    fill
                    sizes="(max-width: 768px) 100vw, 208px"
                    className="object-contain"
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          // STATIC: This version is for when you have 4 or fewer logos.
          <div className="w-full flex items-center justify-center flex-wrap gap-16 px-4">
            {sponsorLogos.map((sponsor) => (
              <div key={sponsor.id} className="relative h-40 w-52">
                <Image
                  src={sponsor.imageUrl}
                  alt={`${sponsor.name} logo`}
                  fill
                  sizes="(max-width: 768px) 100vw, 208px"
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
