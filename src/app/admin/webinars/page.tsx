
'use client';

import {
  collection,
  query,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Pencil,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Course } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type WebinarItem = Course & { id: string };

const PERMISSION_ERROR_MESSAGE = "Permission denied. Please ensure your account has 'admin' privileges and your session is active.";

export default function AdminWebinarsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();

  const webinarsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Remove orderBy from query to fetch all documents, even those without 'sortOrder'.
    // The list component will handle sorting on the client side.
    return query(collection(firestore, 'webinars'));
  }, [firestore]);

  const { data: webinars, isLoading } = useCollection<Course>(webinarsQuery);

  const handleSaveOrder = async (itemsToSave: WebinarItem[]) => {
    if (!firestore || !user) return;

    try {
      await user.getIdToken(true);
      
      const batch = writeBatch(firestore);
      itemsToSave.forEach((item, index) => {
        const docRef = doc(firestore, 'webinars', item.id);
        batch.update(docRef, { sortOrder: index });
      });

      await batch.commit();
      toast({
        title: 'Order Saved',
        description: 'The new order of webinars has been saved.',
      });
    } catch (error: any) {
        if (error.code === 'permission-denied') {
            toast({
                variant: 'destructive',
                title: 'Action Failed',
                description: PERMISSION_ERROR_MESSAGE,
            });
        } else {
            console.error('Error saving order:', error);
            toast({
                variant: 'destructive',
                title: 'Error Saving Order',
                description: error.message || 'Could not save the new order.',
            });
        }
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-headline">Manage Webinars</h2>
          <p className="text-muted-foreground">
            Add, edit, and reorder webinars. The order here will be reflected on the homepage.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/webinars/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Webinar
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Webinars</CardTitle>
          <CardDescription>
            Drag the handle to reorder the webinars.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : webinars && webinars.length > 0 ? (
            <DraggableWebinarList
              items={webinars}
              onOrderSave={handleSaveOrder}
            />
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No webinars found.</p>
              <Button
                variant="link"
                className="mt-2"
                asChild
              >
                <Link href="/admin/webinars/new">
                    Add the first webinar
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- DRAGGABLE LIST COMPONENT ---
interface DraggableWebinarListProps {
  items: WebinarItem[];
  onOrderSave: (items: WebinarItem[]) => void;
}

function DraggableWebinarList({ items, onOrderSave }: DraggableWebinarListProps) {
  const [localItems, setLocalItems] = useState<WebinarItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (items) {
      // Sort items client-side. Documents without 'sortOrder' will be placed at the end.
      const sortedItems = [...items].sort((a, b) => {
        const orderA = typeof a.sortOrder === 'number' ? a.sortOrder : Infinity;
        const orderB = typeof b.sortOrder === 'number' ? b.sortOrder : Infinity;
        if (orderA === orderB) {
            // Fallback sort for items with same/no sortOrder (e.g., by title)
            return a.title.localeCompare(b.title);
        }
        return orderA - orderB;
      });
      setLocalItems(sortedItems);
    }
  }, [items]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      return;
    }
    const newItems = [...localItems];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setLocalItems(newItems);
    onOrderSave(newItems);
    setDraggedIndex(null);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localItems.length) return;
    const newItems = [...localItems];
    const [item] = newItems.splice(index, 1);
    newItems.splice(newIndex, 0, item);
    setLocalItems(newItems);
    onOrderSave(newItems);
  };

  return (
    <div className="space-y-4">
      {localItems.map((item, index) => (
        <div
          key={item.id}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(index)}
          onDragEnd={handleDragEnd}
          className={cn(
            'flex items-center gap-4 p-4 border rounded-lg transition-opacity bg-background',
            draggedIndex !== null && draggedIndex !== index && 'opacity-50',
            draggedIndex === index && 'opacity-75 shadow-lg'
          )}
        >
          <div className="flex flex-col items-center justify-center gap-1 self-stretch">
             <Button
              variant="ghost"
              size="icon"
              className="cursor-grab h-8 w-8"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
            >
              <GripVertical className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={index === 0}
              onClick={() => moveItem(index, 'up')}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={index === localItems.length - 1}
              onClick={() => moveItem(index, 'down')}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
          <WebinarItemCard course={item} />
        </div>
      ))}
    </div>
  );
}


function WebinarItemCard({ course }: { course: WebinarItem }) {
    const { price, discountType, discountValue } = course;
    const [displayPrice, setDisplayPrice] = React.useState({ original: '', final: '' });
    const statusVariant = course.status === "Published" ? "default" : course.status === "Draft" ? "secondary" : "destructive";

    React.useEffect(() => {
        const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);

        let finalPriceValue: number | null = null;
        if (discountType && discountType !== 'none' && discountValue && discountValue > 0) {
            if (discountType === 'percentage') {
                finalPriceValue = price * (1 - discountValue / 100);
            } else if (discountType === 'nominal') {
                finalPriceValue = price - discountValue;
            }
        }
        
        setDisplayPrice({
            original: formatCurrency(price),
            final: finalPriceValue !== null ? formatCurrency(finalPriceValue) : ''
        });

    }, [price, discountType, discountValue]);

    return (
        <TooltipProvider>
            <div className="flex-grow flex items-center gap-4 w-full">
                <Image 
                    src={course.imageUrl}
                    alt={course.title}
                    width={128}
                    height={72}
                    className="rounded-md object-cover aspect-[16/9] shrink-0"
                />
                <div className="flex-grow min-w-0">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <p className="font-semibold truncate cursor-default">{course.title}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{course.title}</p>
                        </TooltipContent>
                    </Tooltip>
                    <p className="text-sm text-muted-foreground">{course.category}</p>
                    <div className="text-sm font-medium mt-1">
                        {displayPrice.final ? (
                            <div>
                                <span className="text-destructive">{displayPrice.final}</span>
                                <span className="text-xs text-muted-foreground line-through ml-2">{displayPrice.original}</span>
                            </div>
                        ) : (
                            <div>{displayPrice.original || '...'}</div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0 ml-auto">
                    <Badge variant={statusVariant} className="whitespace-nowrap">{course.status}</Badge>
                    <Button variant="outline" asChild size="sm">
                        <Link href={`/admin/webinars/${course.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </TooltipProvider>
    )
}
