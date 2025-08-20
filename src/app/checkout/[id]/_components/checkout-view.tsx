
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import type { Course } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';

// This is a dedicated Client Component responsible for rendering the UI.
// It receives the course data as props from the Server Component (the page).
export function CheckoutView({ course }: { course: Course }) {
  const [formattedPrice, setFormattedPrice] = React.useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // In a real app, this would come from an auth context or state management.
  // We simulate it based on a URL query parameter for this demo.
  const isLoggedIn = searchParams.get('loggedIn') === 'true';

  const user = isLoggedIn 
    ? { name: "Demo User", email: "demo@example.com" }
    : { name: "Guest User", email: "guest@example.com" };


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
  

  const handlePayment = () => {
    // If the user is logged in, proceed to the success page.
    // Otherwise, redirect them to the login page.
    if(isLoggedIn) {
      router.push(`/checkout/success?courseId=${course.id}`);
    } else {
      // We pass a redirect query to come back here after login.
      router.push(`/login?redirect=/checkout/${course.id}`);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-headline font-bold mb-8 text-center">Checkout</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>
            You are about to enroll in the following course. Please review the details before proceeding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <Image
              src={course.imageUrl}
              data-ai-hint="online course summary"
              alt={course.title}
              width={200}
              height={125}
              className="rounded-lg object-cover w-full md:w-1/4 h-auto"
            />
            <div className="flex-grow">
              <h2 className="text-xl font-semibold font-headline">{course.title}</h2>
              <p className="text-muted-foreground text-sm">Category: {course.category}</p>
              <p className="text-muted-foreground text-sm">Instructor: {course.instructor.name}</p>
            </div>
            <div className="text-2xl font-bold text-right md:text-left">
              {formattedPrice || '...'}
            </div>
          </div>
          <Separator className="my-6" />
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Billed to:</h3>
              <p className="text-sm text-muted-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {!isLoggedIn && (
                <p className="text-xs text-muted-foreground mt-1">
                  (You are not logged in. You will be asked to log in or sign up.)
                </p>
              )}
            </div>
            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formattedPrice || '...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (0%)</span>
                <span>Rp0</span>
              </div>
              <Separator/>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formattedPrice || '...'}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch space-y-4">
          <Button size="lg" className="w-full" onClick={handlePayment}>
            Proceed to iPaymu
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By proceeding, you agree to our Terms of Service.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
