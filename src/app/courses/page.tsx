'use client';

import { CourseCard } from "@/components/course-card";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import type { Course } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const CourseCardSkeleton = () => (
    <div className="flex flex-col h-full overflow-hidden transition-all duration-300 rounded-lg border">
        <Skeleton className="w-full h-48" />
        <div className="p-4 flex-grow">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="p-4 pt-0 flex justify-between items-center text-sm border-t mt-auto">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
        </div>
    </div>
);

export default function CoursesPage() {
    const firestore = useFirestore();

    const coursesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "courses"), where("status", "==", "Published"), orderBy("title", "asc"));
    }, [firestore]);

    const { data: courses, isLoading } = useCollection<Course>(coursesQuery);

    return (
        <div className="container mx-auto px-4 py-12">
            <section className="w-full py-12 md:py-16 text-center bg-background">
                <div className="container px-4 md:px-6">
                    <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl text-primary">
                        All Webinars
                    </h1>
                    <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                        Find the perfect webinar to boost your skills.
                    </p>
                </div>
            </section>

            <section className="w-full py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <>
                            <CourseCardSkeleton />
                            <CourseCardSkeleton />
                            <CourseCardSkeleton />
                        </>
                    ) : courses && courses.length > 0 ? (
                        courses.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))
                    ) : (
                         <div className="col-span-full text-center py-12">
                            <p className="text-muted-foreground">No published webinars found at the moment.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
