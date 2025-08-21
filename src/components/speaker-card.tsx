
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import type { Speaker } from '@/types';
import { cn } from '@/lib/utils';

interface SpeakerCardProps {
  speaker: Speaker;
}

export function SpeakerCard({ speaker }: SpeakerCardProps) {
  return (
    <div className="relative group pt-4 h-full">
      <Card className="overflow-visible group rounded-xl shadow-lg flex flex-col h-full">
        <div className="relative">
          <Image
            src={speaker.imageUrl}
            alt={speaker.name}
            data-ai-hint="speaker photo"
            width={300}
            height={400}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-xl"
          />
        </div>
        <CardContent className="p-4 bg-white rounded-b-xl relative flex flex-col flex-grow">
          <div className="absolute -top-5 left-4 z-10">
            <div 
              style={{ backgroundColor: speaker.category.color }}
              className={cn("p-3 rounded-lg shadow-md")}
            >
              <speaker.category.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          {/* Spacer div to ensure consistent alignment */}
          <div className="mt-2 min-h-[56px]">
            <h3 className="font-bold font-headline text-lg">{speaker.name}</h3>
            <p className="text-sm text-secondary-foreground">{speaker.title}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
