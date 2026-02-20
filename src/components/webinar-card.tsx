
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/types';
import { Star, Users, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import React from 'react';

interface WebinarCardProps {
  course: Course;
}

export function WebinarCard({ course }: WebinarCardProps) {
    const [displayPrice, setDisplayPrice] = React.useState({ original: '', final: '' });

    React.useEffect(() => {
        const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);

        const { price, discountType, discountValue } = course;
        let finalPrice: number | null = null;
        if (discountType && discountType !== 'none' && discountValue && discountValue > 0) {
            if (discountType === 'percentage') {
                finalPrice = price * (1 - discountValue / 100);
            } else if (discountType === 'nominal') {
                finalPrice = price - discountValue;
            }
        }
        
        setDisplayPrice({
            original: formatCurrency(price),
            final: finalPrice !== null ? formatCurrency(finalPrice) : ''
        });

    }, [course]);

    const courseDateObject = course.courseDate && typeof (course.courseDate as any).toDate === 'function' 
        ? (course.courseDate as any).toDate() 
        : course.courseDate ? new Date(course.courseDate) : null;

  return (
    <Link href={`/webinar/${course.slug}`}>
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative">
            <Image
              src={course.imageUrl}
              data-ai-hint="online course"
              alt={course.title}
              width={600}
              height={400}
              className="w-full h-48 object-cover"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <div className="flex justify-between items-start mb-2">
              <Badge variant="secondary">{course.category}</Badge>
              <div className="text-right">
                {displayPrice.final ? (
                    <>
                        <p className="text-lg font-bold text-primary">{displayPrice.final}</p>
                        <p className="text-xs text-muted-foreground line-through">{displayPrice.original}</p>
                    </>
                ) : (
                    <p className="text-lg font-bold text-primary">{displayPrice.original || '...'}</p>
                )}
              </div>
          </div>
          <h3 className="text-lg font-bold font-headline mb-2">{course.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{course.instructor.name}</p>
          <div className="space-y-2 text-sm text-muted-foreground">
             {courseDateObject && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(courseDateObject, "dd MMMM yyyy")}</span>
              </div>
            )}
            {course.courseTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Pukul {course.courseTime} WIB</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground border-t mt-auto">
            <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{course.rating}</span>
                <span className="text-xs">({course.reviewCount} reviews)</span>
            </div>
             <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.enrollmentCount || 0} students</span>
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
