'use client';

import type { Course } from '@/types';
import { useEffect, useState } from 'react';
import { runCourseRecommendations } from '@/actions/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Terminal, Sparkles } from 'lucide-react';
import { CourseRecommendationsOutput } from '@/ai/flows/course-recommendations';
import { Button } from './ui/button';
import Link from 'next/link';
import { courses } from '@/lib/mock-data';

interface CourseRecommendationsProps {
  currentCourse: Course;
}

export default function CourseRecommendations({ currentCourse }: CourseRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<CourseRecommendationsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        setError(null);
        const result = await runCourseRecommendations({
          course: {
            id: currentCourse.id,
            title: currentCourse.title,
            category: currentCourse.category,
            description: currentCourse.description,
          },
        });
        setRecommendations(result);
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred.');
        }
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, [currentCourse]);

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-7 w-48" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    )
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center justify-center text-muted-foreground">
                <p>No recommendations available at this time.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="h-6 w-6" />
                <span>AI Recommendations</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            {recommendations.recommendations.map((rec) => (
                <div key={rec.id} className="p-4 rounded-md bg-background border">
                     <h4 className="font-headline font-semibold">{rec.title}</h4>
                     <p className="text-sm text-muted-foreground mt-1 mb-3">{rec.reason}</p>
                     <Button asChild size="sm" variant="outline">
                         <Link href={`/courses/${rec.id}`}>View Course</Link>
                     </Button>
                </div>
            ))}
      </CardContent>
    </Card>
  );
}
