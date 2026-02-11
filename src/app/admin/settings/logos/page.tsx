
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
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  PlusCircle,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ExternalLink,
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
import type { SponsorLogo } from '@/types';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';

// Type alias for our data items from Firestore
type SponsorItem = SponsorLogo & { id: string };

const PERMISSION_ERROR_MESSAGE = "Permission denied. Please ensure your account has 'admin' privileges and your session is active.";

export default function AdminSponsorsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();

  const sponsorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sponsor_logos'), orderBy('sortOrder', 'asc'));
  }, [firestore]);

  const { data: sponsors, isLoading } = useCollection<SponsorLogo>(sponsorsQuery);

  const handleAddNewSponsor = async () => {
    if (!firestore || !user) return;
    
    try {
      await user.getIdToken(true);
      
      const newSponsorPayload = {
        name: `Sponsor ${sponsors ? sponsors.length + 1 : 1}`,
        imageUrl: `https://placehold.co/200x160/e2e8f0/e2e8f0?text=New+Sponsor`,
        ctaText: 'Visit Website',
        ctaLink: '#',
        sortOrder: sponsors && sponsors.length > 0 ? Math.max(...sponsors.map(item => item.sortOrder)) + 1 : 0,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(firestore, 'sponsor_logos'), newSponsorPayload);
      
      toast({
        title: 'Sponsor Added',
        description: 'A new sponsor has been created. You can now upload an image.',
      });

    } catch (error: any) {
        console.error("Error adding new sponsor:", error);
        if (error.code === 'permission-denied') {
            toast({
              variant: 'destructive',
              title: 'Action Failed',
              description: PERMISSION_ERROR_MESSAGE,
            });
        } else {
            toast({
              variant: 'destructive',
              title: 'Error Adding Sponsor',
              description: error.message || 'An unexpected error occurred.',
            });
        }
    }
  };

  const handleSaveOrder = async (itemsToSave: SponsorItem[]) => {
    if (!firestore || !user) return;

    try {
      await user.getIdToken(true);
      
      const batch = writeBatch(firestore);
      itemsToSave.forEach((item, index) => {
        const docRef = doc(firestore, 'sponsor_logos', item.id);
        batch.update(docRef, { 
          sortOrder: index
        });
      });

      await batch.commit();
      toast({
        title: 'Order Saved',
        description: 'The new order of the sponsors has been saved.',
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
          <h2 className="text-2xl font-bold font-headline">Sponsor Logo Settings</h2>
          <p className="text-muted-foreground">
            Manage the scrolling sponsor logos on your homepage.
          </p>
        </div>
        <Button onClick={handleAddNewSponsor} disabled={isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Sponsor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Sponsors</CardTitle>
          <CardDescription>
            Manage the sponsors in your homepage marquee. Drag the handle to reorder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : sponsors && sponsors.length > 0 ? (
            <DraggableSponsorList
              items={sponsors}
              onOrderSave={handleSaveOrder}
            />
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No sponsors found.</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={handleAddNewSponsor}
              >
                Add the first sponsor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- DRAGGABLE LIST COMPONENT ---
interface DraggableSponsorListProps {
  items: SponsorItem[];
  onOrderSave: (items: SponsorItem[]) => void;
}

function DraggableSponsorList({ items, onOrderSave }: DraggableSponsorListProps) {
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
          <SponsorItemForm item={item} />
        </div>
      ))}
    </div>
  );
}

// --- FORM FOR A SINGLE SPONSOR ITEM ---
interface SponsorItemFormProps {
  item: SponsorItem;
}

function SponsorItemForm({ item }: SponsorItemFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
      ...item,
      ctaText: item.ctaText || '',
      ctaLink: item.ctaLink || '',
  });
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({
        ...item,
        ctaText: item.ctaText || '',
        ctaLink: item.ctaLink || '',
    });
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
        await user.getIdToken(true);
        setIsSaving(true);
        
        let dataToUpdate: { name: string; ctaText: string; ctaLink: string; imageUrl?: string; } = {
          name: formData.name,
          ctaText: formData.ctaText || '',
          ctaLink: formData.ctaLink || '',
        };
        
        if (newImageFile) {
            setIsUploading(true);
            const imageRef = ref(storage, `hero-images/sponsor_logos/${item.id}_${newImageFile.name}`);
            const uploadTask = await uploadBytes(imageRef, newImageFile);
            const downloadURL = await getDownloadURL(uploadTask.ref);
            
            toast({ title: 'Image Uploaded' });
            dataToUpdate.imageUrl = downloadURL;
            setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
            setIsUploading(false);
        }

        const docRef = doc(firestore, 'sponsor_logos', item.id);
        await updateDoc(docRef, { ...dataToUpdate });

        toast({ title: 'Sponsor Saved', description: 'Your changes have been saved.' });
        setNewImageFile(null);
        setUploadPreviewUrl(null);
    } catch(error: any) {
        console.error("Save Error:", error);
        toast({
            variant: 'destructive',
            title: 'Error Saving Data',
            description: error.message || 'Could not save your changes.',
        });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!firestore || !storage || !user) return;

    try {
      await user.getIdToken(true);
      
      if (item.imageUrl && item.imageUrl.includes('firebasestorage.googleapis.com')) {
        const imageRef = ref(storage, item.imageUrl);
        try {
          await deleteObject(imageRef);
        } catch (storageError: any) {
          if (storageError.code !== 'storage/object-not-found') {
            throw storageError;
          }
        }
      }

      await deleteDoc(doc(firestore, 'sponsor_logos', item.id));

      toast({
        title: 'Sponsor Deleted',
        description: 'The sponsor has been successfully removed.',
      });

    } catch (error: any) {
        console.error("Deletion Error:", error);
        if (error.code === 'permission-denied' || error.code === 'storage/unauthorized') {
             toast({
                variant: 'destructive',
                title: 'Delete Failed',
                description: PERMISSION_ERROR_MESSAGE,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error Deleting Sponsor',
                description: error.message || 'An unexpected error occurred during deletion.',
            });
        }
    }
  };

  const totalLoading = isSaving || isUploading;
  const imageUrlToPreview = uploadPreviewUrl || formData.imageUrl;
  const isPlaceholder = imageUrlToPreview.includes('placehold.co');

  return (
    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div className="space-y-2">
        <div className="hidden">
            <Label htmlFor={`name-${item.id}`}>Sponsor Name</Label>
             <Input
                id={`name-${item.id}`}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={totalLoading}
            />
        </div>
        <div className="hidden">
            <Label htmlFor={`ctaText-${item.id}`}>CTA Text</Label>
            <Input
                id={`ctaText-${item.id}`}
                name="ctaText"
                value={formData.ctaText}
                onChange={handleInputChange}
                disabled={totalLoading}
            />
        </div>
        <div className="hidden">
            <Label htmlFor={`ctaLink-${item.id}`}>CTA Link</Label>
            <Input
                id={`ctaLink-${item.id}`}
                name="ctaLink"
                value={formData.ctaLink}
                onChange={handleInputChange}
                disabled={totalLoading}
            />
        </div>
        <Label>Image Preview</Label>
        <Image
          key={imageUrlToPreview}
          src={imageUrlToPreview || 'https://placehold.co/200x160/e2e8f0/e2e8f0?text=No+Image'}
          alt={item.name || "Sponsor image"}
          width={200}
          height={160}
          className={cn(
            "rounded-md object-contain bg-muted h-24 w-full",
            uploadPreviewUrl && "ring-2 ring-primary"
          )}
          unoptimized
        />
         <Button
          type="button"
          size="sm"
          variant="default"
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
          accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml"
          disabled={totalLoading}
        />
      </div>

      <div className="flex flex-col justify-between h-full">
        <div className="space-y-1">
            <Label htmlFor={`imageUrl-${item.id}`}>Image URL</Label>
            <div className="flex items-center gap-2">
                <Input
                    id={`imageUrl-${item.id}`}
                    value={formData.imageUrl}
                    readOnly
                    disabled
                    className="h-8 bg-muted/50 border-dashed text-xs flex-grow"
                    placeholder="No image uploaded yet"
                />
                {!isPlaceholder && (
                     <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={formData.imageUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                )}
            </div>
        </div>
        
        <div className="flex justify-end items-center gap-2 mt-4">
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
                  This action cannot be undone. This will permanently delete the sponsor.
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
          <Button onClick={handleSave} size="sm" disabled={totalLoading || (!newImageFile && formData.name === item.name && formData.ctaLink === item.ctaLink && formData.ctaText === item.ctaText) }>
            {isUploading ? 'Uploading...' : isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}

    
