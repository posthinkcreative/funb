
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import type { Speaker, PractitionerCategory } from '@/types';
import { cn } from '@/lib/utils';
import { Briefcase, BarChart, Code, Megaphone, Palette } from 'lucide-react';

const categoryDetailsMap: Record<PractitionerCategory, { icon: React.ComponentType<{ className?: string }>, color: string }> = {
    'Business': { icon: Briefcase, color: '#9333ea' },
    'Data Science': { icon: BarChart, color: '#ea580c' },
    'Development': { icon: Code, color: '#2563eb' },
    'Marketing': { icon: Megaphone, color: '#db2777' },
    'Design': { icon: Palette, color: '#16a34a' }
};

interface SpeakerCardProps {
  speaker: Speaker;
}

export function SpeakerCard({ speaker }: SpeakerCardProps) {
  const categoryDetails = categoryDetailsMap[speaker.categoryName];

  if (!categoryDetails) {
    // Fallback for unknown categories
    return null;
  }

  const CategoryIcon = categoryDetails.icon;

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
              style={{ backgroundColor: categoryDetails.color }}
              className={cn("p-3 rounded-lg shadow-md")}
            >
              <CategoryIcon className="w-6 h-6 text-white" />
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
