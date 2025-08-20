
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { courses } from '@/lib/mock-data';
import React from 'react';

export function SuccessView() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const course = courses.find(c => c.id === courseId);
  const [formattedPrice, setFormattedPrice] = React.useState('');

  React.useEffect(() => {
    // Client-side effect for formatting currency to avoid hydration errors.
    if (course) {
        const formatted = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(course.price);
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
            Thank you for your purchase. You are now enrolled in the course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {course ? (
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
             <p className="text-muted-foreground">Could not load course details.</p>
          )}
          <Button asChild size="lg" className="mt-8 w-full md:w-auto">
            <Link href="/courses">Explore More Courses</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
