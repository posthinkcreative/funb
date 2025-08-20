
import { CourseCard } from "@/components/course-card";
import { courses } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// In a real app, this would be fetched based on the logged-in user.
// Here we just take a slice of the mock data to simulate purchased courses.
const purchasedCourses = courses.slice(0, 2);

export default function MyCoursesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
        <CardDescription>
          All the courses you have enrolled in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {purchasedCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {purchasedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground mt-8">
            You haven't enrolled in any courses yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
