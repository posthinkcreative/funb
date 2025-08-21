
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import type { AlumniTestimonial } from '@/types';
import { ChevronDown } from 'lucide-react';

interface AlumniCardProps {
  testimonial: AlumniTestimonial;
}

export function AlumniCard({ testimonial }: AlumniCardProps) {
  return (
    <Card className="rounded-xl shadow-lg overflow-hidden w-full flex flex-col h-full bg-white">
      {/* --- Bagian Atas: Header Berwarna dan Avatar --- */}
      <div className="relative text-center">
        <div style={{ backgroundColor: testimonial.bgColor }} className="h-20" />
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
            <Image
              src={testimonial.avatarUrl}
              data-ai-hint="alumni avatar"
              alt={testimonial.name}
              width={80}
              height={80}
              className="w-20 h-20 object-cover rounded-full border-4 border-white"
            />
        </div>
      </div>
      
      {/* --- Bagian Tengah: Nama dan Batch (dengan ruang yang ditentukan) --- */}
      <div className="text-center px-6 pt-12 pb-4">
        {/* Ruang kaku untuk nama (2 baris) dan batch (1 baris) */}
        <div className="h-20">
          <h3 className="font-bold font-headline text-lg text-black">{testimonial.name}</h3>
          <p className="text-sm text-black/80">{testimonial.batch}</p>
        </div>
      </div>

      {/* --- Bagian Bawah: Konten "Before" dan "After" dengan Grid Kaku --- */}
      <CardContent className="px-6 pb-6 flex-grow flex flex-col">
        {/* Grid kaku untuk memastikan kesejajaran antar kartu */}
        <div className="flex-grow grid grid-rows-[minmax(4.5rem,auto)_auto_minmax(4.5rem,auto)_minmax(3rem,auto)] gap-2">
            
            {/* Slot untuk "Before" */}
            <div className="text-center self-start">
              <p className="text-sm text-muted-foreground mb-1">Before</p>
              <p className="font-semibold text-base">{testimonial.before.role}</p>
              <p className="text-sm text-muted-foreground">{testimonial.before.university}</p>
            </div>

            {/* Slot untuk Ikon Panah */}
            <div className="flex items-center justify-center my-2">
                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                    <ChevronDown className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Slot untuk "After" */}
            <div className="text-center self-start">
                <p className="text-sm text-muted-foreground mb-1">After</p>
                <p className="font-semibold text-base">{testimonial.after.role}</p>
                <p className="text-sm text-muted-foreground mb-3">{testimonial.after.company}</p>
            </div>

            {/* Slot untuk Logo Perusahaan */}
            <div className="flex justify-center items-center self-end">
                <Image
                  src={testimonial.after.companyLogoUrl}
                  data-ai-hint="company logo"
                  alt={`${testimonial.after.company} logo`}
                  width={100}
                  height={40}
                  className="object-contain max-h-10"
                />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
