
"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Course } from "@/types"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import React from "react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useStorage, useUser } from "@/firebase"
import { doc, deleteDoc, updateDoc } from "firebase/firestore"
import { ref, deleteObject } from 'firebase/storage'

function PriceCell({ row }: { row: any }) {
    const { price, discountType, discountValue } = row.original;
    const [displayPrice, setDisplayPrice] = React.useState({ original: '', final: '' });

    React.useEffect(() => {
        const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);

        let finalPrice: number | null = null;
        if (discountType && discountType !== 'none' && discountValue && discountValue > 0) {
            if (discountType === 'percentage') {
                finalPrice = price * (1 - discountValue / 100);
            } else if (discountType === 'nominal') {
                finalPrice = price - discountValue;
            }
        }
        
        setDisplayPrice({
            original: formatCurrency(price),
            final: finalPrice !== null ? formatCurrency(finalPrice) : ''
        });

    }, [price, discountType, discountValue]);

    if (displayPrice.final) {
        return (
            <div className="text-left font-medium">
                <span className="text-destructive">{displayPrice.final}</span>
                <span className="text-xs text-muted-foreground line-through ml-2">{displayPrice.original}</span>
            </div>
        )
    }

    return <div className="text-left font-medium">{displayPrice.original || '...'}</div>;
}


function ActionsCell({ course }: { course: Course }) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const firestore = useFirestore();
  const storage = useStorage();
  const { user } = useUser();


  const handleDelete = async () => {
    if (!firestore || !storage) {
        toast({ title: "Error", description: "Firebase not initialized.", variant: "destructive" });
        return;
    }
    try {
        // Delete image from storage if it's a firebase storage URL
        if (course.imageUrl && course.imageUrl.includes('firebasestorage.googleapis.com')) {
            try {
                await deleteObject(ref(storage, course.imageUrl));
            } catch (e: any) {
                // If object does not exist, we can ignore the error
                if (e.code !== 'storage/object-not-found') {
                    console.error("Could not delete webinar image:", e);
                }
            }
        }
        // Delete video from storage if it's a firebase storage URL
        if (course.videoUrl && course.videoUrl.includes('firebasestorage.googleapis.com')) {
             try {
                await deleteObject(ref(storage, course.videoUrl));
            } catch (e: any) {
                // If object does not exist, we can ignore the error
                if (e.code !== 'storage/object-not-found') {
                    console.error("Could not delete webinar video:", e);
                }
            }
        }

        // Delete the document from Firestore
        await deleteDoc(doc(firestore, "webinars", course.id));
        
        toast({
          title: "Webinar Deleted",
          description: `The webinar "${course.title}" has been successfully deleted.`,
        });
    
    } catch (error: any) {
      toast({
        title: "Error Deleting Webinar",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!firestore || !user) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
    }

    const newStatus = course.status === 'Published' ? 'Archived' : 'Published';
    
    try {
        await user.getIdToken(true);
        const courseRef = doc(firestore, "webinars", course.id);
        await updateDoc(courseRef, { status: newStatus });
        toast({
            title: `Webinar status updated`,
            description: `"${course.title}" is now ${newStatus.toLowerCase()}.`,
        });
    } catch (error: any) {
        toast({
            title: "Error Updating Status",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    }
  };

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/admin/webinars/${course.slug}/edit`}>Edit Webinar</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleStatusToggle}>
            {course.status === 'Published' ? 'Archive Webinar' : 'Publish Webinar'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
           <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                Delete Webinar
              </DropdownMenuItem>
            </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

       <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the webinar
            "{course.title}" and its associated media.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        return <div className="font-medium">{row.original.title}</div>
    }
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: PriceCell,
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === "Published" ? "default" : status === "Draft" ? "secondary" : "outline";
        return <Badge variant={variant}>{status}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const course = row.original
      return <ActionsCell course={course} />
    },
  },
]
