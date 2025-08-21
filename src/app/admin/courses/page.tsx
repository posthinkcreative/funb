
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { DataTable } from "./_components/data-table"
import { columns } from "./_components/columns"
import { courses } from "@/lib/mock-data"
import Link from "next/link"

export default function AdminCoursesPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-headline">Manage Courses</h2>
          <p className="text-muted-foreground">Here you can add, edit, and delete courses.</p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Course
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={courses} />
    </div>
  )
}
