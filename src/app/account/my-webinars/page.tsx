'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { WebinarCard } from "@/components/webinar-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import type { Course } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const WebinarCardSkeleton = () => (
  <Card>
    <CardHeader className="p-0">
      <Skeleton className="h-48 w-full" />
    </CardHeader>
    <CardContent className="p-4">
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardContent>
    <CardFooter className="p-4 pt-0">
      <Skeleton className="h-5 w-full" />
    </CardFooter>
  </Card>
);

export default function MyWebinarsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      setIsLoadingCourses(false);
      return;
    };

    const fetchPurchasedCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const userRef = doc(firestore, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const enrolledCourseIds = userData.enrolledCourseIds || [];
          
          if (enrolledCourseIds.length > 0) {
            const coursesQuery = query(collection(firestore, "webinars"), where(documentId(), "in", enrolledCourseIds));
            const coursesSnapshot = await getDocs(coursesQuery);
            const coursesData = coursesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Course[];
            
            setPurchasedCourses(coursesData);
          } else {
             setPurchasedCourses([]);
          }
        }
      } catch (error) {
        console.error("Error fetching purchased webinars:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchPurchasedCourses();
  }, [user, isUserLoading, firestore]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Webinars</CardTitle>
        <CardDescription>
          All the webinars you have enrolled in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isUserLoading || isLoadingCourses ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <WebinarCardSkeleton />
              <WebinarCardSkeleton />
            </div>
        ) : purchasedCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {purchasedCourses.map((course) => (
              <WebinarCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              You haven't enrolled in any webinars yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
