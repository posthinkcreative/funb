
'use client';

import {
  collection,
  query,
  orderBy,
  addDoc,
  writeBatch,
  doc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useStorage, useUser } from '@/firebase';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
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
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { HeroCarouselItem } from '@/types';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';

// Type alias for our data items from Firestore
type HeroItem = HeroCarouselItem & { id: string };

const PERMISSION_ERROR_MESSAGE = "Permission denied. Please ensure your account has 'admin' privileges in the Users panel.";

export default function AdminSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();

  const heroItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'heroItems'), orderBy('sortOrder', 'asc'));
  }, [firestore]);

  const { data: heroItems, isLoading } = useCollection<HeroCarouselItem>(heroItemsQuery);

  const handleAddNewSlide = async () => {
    if (!firestore || !user) return;
    
    try {
      await user.getIdToken(true); // Force refresh token to get latest claims
      
      const newSlidePayload = {
        title: `Image ${heroItems ? heroItems.length + 1 : 1}`,
        ctaText: 'Learn More',
        ctaLink: '/courses',
        imageUrl: `https://placehold.co/1920x1080/e2e8f0/e2e8f0?text=New+Slide`,
        sortOrder: heroItems && heroItems.length > 0 ? Math.max(...heroItems.map(item => item.sortOrder)) + 1 : 0,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(firestore, 'heroItems'), newSlidePayload);
      
      toast({
        title: 'Slide Added',
        description: 'A new slide has been created. You can now edit it.',
      });

    } catch (error: any) {
      if (error.code === 'permission-denied') {
        toast({
          variant: 'destructive',
          title: 'Action Failed',
          description: PERMISSION_ERROR_MESSAGE,
        });
      } else {
        console.error("Error adding new slide:", error);
        toast({
          variant: 'destructive',
          title: 'Error Adding Slide',
          description: error.message || 'An unexpected error occurred.',
        });
      }
    }
  };

  const handleSaveOrder = async (itemsToSave: HeroItem[]) => {
    if (!firestore || !user) return;
    
    try {
      await user.getIdToken(true); // Force refresh token

      const batch = writeBatch(firestore);
      itemsToSave.forEach((item, index) => {
        const docRef = doc(firestore, 'heroItems', item.id);
        batch.update(docRef, { 
          sortOrder: index
        });
      });

      await batch.commit();
      toast({
        title: 'Order Saved',
        description: 'The new order of the slides has been saved.',
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
          description: 'Could not save the new order.',
        });
      }
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-headline">Website Settings</h2>
          <p className="text-muted-foreground">
            Manage the content displayed on your website's homepage.
          </p>
        </div>
        <Button onClick={handleAddNewSlide} disabled={isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Slide
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero Carousel Settings</CardTitle>
          <CardDescription>
            Manage the slides in your homepage carousel. Drag the handle to reorder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : heroItems && heroItems.length > 0 ? (
            <DraggableHeroList
              items={heroItems}
              onOrderSave={handleSaveOrder}
            />
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No slides found.</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={handleAddNewSlide}
              >
                Add the first slide
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- DRAGGABLE LIST COMPONENT ---
interface DraggableHeroListProps {
  items: HeroItem[];
  onOrderSave: (items: HeroItem[]) => void;
}

function DraggableHeroList({ items, onOrderSave }: DraggableHeroListProps) {
  const [localItems, setLocalItems] = useState(items);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalItems(items);
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
          draggable={draggedIndex === index}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(index)}
          onDragEnd={handleDragEnd}
          className={cn(
            'flex items-start gap-4 p-4 border rounded-lg transition-opacity',
            draggedIndex !== null && draggedIndex !== index && 'opacity-50',
            draggedIndex === index && 'opacity-75 shadow-lg'
          )}
        >
          <div className="flex flex-col items-center gap-1 pt-1">
             <Button
              variant="ghost"
              size="icon"
              className="cursor-grab h-8 w-8"
              onMouseDown={() => setDraggedIndex(index)}
              onMouseUp={() => setDraggedIndex(null)}
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
          <HeroItemForm item={item} />
        </div>
      ))}
    </div>
  );
}

// --- FORM FOR A SINGLE HERO ITEM ---
interface HeroItemFormProps {
  item: HeroItem;
}

function HeroItemForm({ item }: HeroItemFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const [formData, setFormData] = useState(item);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(item);
    setNewImageFile(null);
    setUploadPreviewUrl(null);
  }, [item]);
  
  useEffect(() => {
    return () => {
        if (uploadPreviewUrl && uploadPreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(uploadPreviewUrl);
        }
    }
  }, [uploadPreviewUrl]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);
      
      if (uploadPreviewUrl && uploadPreviewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(uploadPreviewUrl);
      }
      setUploadPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!firestore || !storage || !user) return;

    try {
        await user.getIdToken(true); // Force refresh token
        setIsSaving(true);
        let dataToUpdate: { ctaText: string; ctaLink: string; imageUrl?: string; } = {
          ctaText: formData.ctaText,
          ctaLink: formData.ctaLink,
        };
        
        if (newImageFile) {
          setIsUploading(true);
          const imageRef = ref(storage, `hero-images/${item.id}/${newImageFile.name}`);
          const uploadTask = await uploadBytes(imageRef, newImageFile);
          const downloadURL = await getDownloadURL(uploadTask.ref);
          
          toast({ title: 'Image Uploaded', description: 'New image uploaded successfully.' });
          dataToUpdate.imageUrl = downloadURL;
          setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
          setIsUploading(false);
        }
      
        const docRef = doc(firestore, 'heroItems', item.id);
        await updateDoc(docRef, { ...dataToUpdate });

        toast({ title: 'Slide Saved', description: 'Your changes have been saved to the database.' });
        setNewImageFile(null);
        setUploadPreviewUrl(null);

    } catch (error: any) {
       if (error.code === 'permission-denied' || error.code === 'storage/unauthorized') {
            toast({
              variant: 'destructive',
              title: 'Save Failed',
              description: PERMISSION_ERROR_MESSAGE,
            });
       } else {
            console.error("Save Error:", error);
            toast({
              variant: 'destructive',
              title: 'Error Saving Data',
              description: error.message || 'Could not save your changes to Firestore.',
            });
       }
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!firestore || !storage || !user) return;

    try {
      await user.getIdToken(true); // Force refresh token

      // Attempt to delete image from storage only if the URL points to Firebase Storage
      if (item.imageUrl && item.imageUrl.includes('firebasestorage.googleapis.com')) {
        const imageRef = ref(storage, item.imageUrl);
        try {
          await deleteObject(imageRef);
        } catch (storageError: any) {
          if (storageError.code !== 'storage/object-not-found') {
            throw storageError;
          }
           console.log("Image not found in storage, but proceeding to delete Firestore doc.");
        }
      }

      await deleteDoc(doc(firestore, 'heroItems', item.id));

      toast({
        title: 'Slide Deleted',
        description: 'The slide has been successfully removed.',
      });

    } catch (error: any) {
      if (error.code === 'permission-denied' || error.code === 'storage/unauthorized') {
        toast({
          variant: 'destructive',
          title: 'Delete Failed',
          description: PERMISSION_ERROR_MESSAGE,
        });
      } else {
        console.error("Deletion Error:", error);
        toast({
          variant: 'destructive',
          title: 'Error Deleting Slide',
          description: error.message || 'An unexpected error occurred during deletion.',
        });
      }
    }
  };

  const totalLoading = isSaving || isUploading;
  const imageUrlToPreview = uploadPreviewUrl || formData.imageUrl;

  return (
    <div className="flex-grow space-y-4">
      {/* Button Text & Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`ctaText-${item.id}`}>Button Text</Label>
          <Input
            id={`ctaText-${item.id}`}
            name="ctaText"
            value={formData.ctaText}
            onChange={handleInputChange}
            placeholder="e.g., Learn More"
            disabled={totalLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`ctaLink-${item.id}`}>Button Link</Label>
          <Input
            id={`ctaLink-${item.id}`}
            name="ctaLink"
            value={formData.ctaLink}
            onChange={handleInputChange}
            placeholder="e.g., /courses"
            disabled={totalLoading}
          />
        </div>
      </div>

      {/* Image & Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Left: Preview */}
        <div className="space-y-2">
          <Label>Image Preview</Label>
          <Image
            key={imageUrlToPreview} // Use key to force re-render on src change
            src={imageUrlToPreview || 'https://placehold.co/160x90/e2e8f0/e2e8f0?text=No+Image'}
            alt={item.title || "Slide image"}
            width={160}
            height={90}
            className={cn(
              "rounded-md object-cover bg-muted aspect-[16/9] w-full",
              uploadPreviewUrl && "ring-2 ring-primary"
            )}
            unoptimized
          />
        </div>
        {/* Right: Controls */}
        <div className="space-y-2">
          <div className="flex flex-col space-y-2">
             <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={totalLoading}
              >
                Choose Image
              </Button>
              <Input
                id={`file-upload-${item.id}`}
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/png, image/jpeg, image/gif, image/webp"
                disabled={totalLoading}
              />
          </div>
          <div className="pt-2">
            <Label htmlFor={`imageUrl-${item.id}`}>Current Saved URL</Label>
            <Input
              id={`imageUrl-${item.id}`}
              value={formData.imageUrl}
              disabled
              className="mt-1 h-8 bg-muted/50 border-dashed text-xs"
              placeholder="No image uploaded yet"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end items-center gap-2 pt-4 border-t mt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive-outline" size="sm" disabled={totalLoading}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the slide and its image from storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button onClick={handleSave} size="sm" disabled={totalLoading || (!newImageFile && formData.ctaLink === item.ctaLink && formData.ctaText === item.ctaText)}>
          {isUploading ? 'Uploading...' : isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
