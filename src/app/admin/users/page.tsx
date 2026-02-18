'use client';
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { UserProfile } from "@/types";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";

export default function AdminUsersPage() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"), orderBy("name"));
  }, [firestore]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-headline">Manage Users</h2>
          <p className="text-muted-foreground">
            View and manage user roles on the platform.
          </p>
        </div>
      </div>
      <DataTable columns={columns} data={users || []} isLoading={isLoading} />
    </div>
  );
}
