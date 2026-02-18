
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import React from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Course } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const firestore = useFirestore();

  const webinarDocRef = useMemoFirebase(() => {
    if (!firestore || !courseId) return null;
    return doc(firestore, 'webinars', courseId as string);
  }, [firestore, courseId]);

  const { data: course, isLoading } = useDoc<Course>(webinarDocRef);

  const [formattedPrice, setFormattedPrice] = React.useState('');

  React.useEffect(() => {
    if (course) {
        const { price, discountType, discountValue } = course;
        let finalPrice: number = price;

        if (discountType && discountType !== 'none' && discountValue && discountValue > 0) {
            if (discountType === 'percentage') {
                finalPrice = price * (1 - discountValue / 100);
            } else if (discountType === 'nominal') {
                finalPrice = price - discountValue;
            }
        }
        
        const formatted = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(finalPrice);
        setFormattedPrice(formatted);
    }
  }, [course]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full text-center shadow-lg">
        <CardHeader className="items-center">
            <div className="p-4 bg-green-100 rounded-full mb-4">
                 <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          <CardTitle className="text-3xl font-headline font-bold">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase. You are now enrolled in the webinar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-4 border rounded-lg bg-muted/50 text-left space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/4 ml-auto" />
            </div>
          ) : course ? (
            <div className="p-4 border rounded-lg bg-muted/50 text-left">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5"/>
                Your Order
              </h3>
              <div className="flex justify-between items-center">
                <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground">{course.category}</p>
                </div>
                <p className="font-bold">{formattedPrice || '...'}</p>
              </div>
            </div>
          ) : (
             <p className="text-muted-foreground">Could not load webinar details.</p>
          )}
          <Button asChild size="lg" className="mt-8 w-full md:w-auto">
            <Link href="/webinar">Explore More Webinars</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
