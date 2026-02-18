'use client';

import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { DataTable } from "./_components/data-table"
import { columns } from "./_components/columns"
import Link from "next/link"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Course } from "@/types";

export default function AdminWebinarsPage() {
  const firestore = useFirestore();

  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "webinars"), orderBy("title", "asc"));
  }, [firestore]);

  const { data: courses, isLoading } = useCollection<Course>(coursesQuery);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-headline">Manage Webinars</h2>
          <p className="text-muted-foreground">Here you can add, edit, and delete webinars.</p>
        </div>
        <Button asChild>
          <Link href="/admin/webinar/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Webinar
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={courses || []} isLoading={isLoading} />
    </div>
  )
}
