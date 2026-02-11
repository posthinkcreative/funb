'use client';

import { notFound, useRouter, useParams } from 'next/navigation';
import { courses } from '@/lib/mock-data';
import type { Course } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

function getCourse(id: string): Course | undefined {
    return courses.find(c => c.id === id);
}

export default function CheckoutPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const course = getCourse(id);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [displayPrice, setDisplayPrice] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const router = useRouter();
  
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
        setDisplayPrice(formatted);
    }
  }, [course]);
  

  const handlePayment = async () => {
    if (!user) {
      router.push(`/login?redirect=/checkout/${course!.id}`);
      return;
    }

    if (!course) return;

    setIsProcessing(true);

    try {
      const userRef = doc(firestore, 'users', user.uid);
      
      // Add the course ID to the user's enrolled courses
      await updateDoc(userRef, {
        enrolledCourseIds: arrayUnion(course.id)
      });
      
      router.push(`/checkout/success?courseId=${course.id}`);

    } catch (error) {
      console.error("Error enrolling in webinar: ", error);
      toast({
        title: "Enrollment Failed",
        description: "Could not enroll you in the webinar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  if (isUserLoading) {
    return <div className="container text-center py-12">Loading user...</div>
  }

  if (!course) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-headline font-bold mb-8 text-center">Checkout</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>
            You are about to enroll in the following webinar. Please review the details before proceeding.
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
              {displayPrice || '...'}
            </div>
          </div>
          <Separator className="my-6" />
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Billed to:</h3>
              {user ? (
                 <>
                  <p className="text-sm text-muted-foreground">{user.displayName || 'No Name'}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                 </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Guest User</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (You are not logged in. You will be asked to log in or sign up.)
                  </p>
                </>
              )}
            </div>
            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{displayPrice || '...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (0%)</span>
                <span>Rp0</span>
              </div>
              <Separator/>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{displayPrice || '...'}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch space-y-4">
          <Button size="lg" className="w-full" onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Proceed to iPaymu"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By proceeding, you agree to our Terms of Service.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
