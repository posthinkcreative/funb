
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  PlusCircle,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Briefcase,
  BarChart,
  Code,
  Megaphone,
  Palette,
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
import type { Speaker, PractitionerCategory } from '@/types';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';

type PractitionerItem = Speaker & { id: string };

const PERMISSION_ERROR_MESSAGE = "Permission denied. Please ensure your account has 'admin' privileges and your session is active.";
const CATEGORIES: PractitionerCategory[] = ['Business', 'Data Science', 'Development', 'Marketing', 'Design'];

const categoryDetailsMap: Record<PractitionerCategory, { icon: React.ComponentType<{ className?: string }>, color: string }> = {
    'Business': { icon: Briefcase, color: '#9333ea' },
    'Data Science': { icon: BarChart, color: '#ea580c' },
    'Development': { icon: Code, color: '#2563eb' },
    'Marketing': { icon: Megaphone, color: '#db2777' },
    'Design': { icon: Palette, color: '#16a34a' }
};


export default function AdminPractitionersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();

  const practitionersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'practitioners'), orderBy('sortOrder', 'asc'));
  }, [firestore]);

  const { data: practitioners, isLoading } = useCollection<Speaker>(practitionersQuery);

  const handleAddNewPractitioner = async () => {
    if (!firestore || !user) return;
    
    try {
      await user.getIdToken(true);
      
      const newPractitionerPayload = {
        name: `Practitioner ${practitioners ? practitioners.length + 1 : 1}`,
        title: 'Professional Title',
        imageUrl: `https://placehold.co/300x400/e2e8f0/e2e8f0?text=New`,
        categoryName: 'Business' as PractitionerCategory,
        sortOrder: practitioners && practitioners.length > 0 ? Math.max(...practitioners.map(item => item.sortOrder)) + 1 : 0,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(firestore, 'practitioners'), newPractitionerPayload);
      
      toast({
        title: 'Practitioner Added',
        description: 'A new practitioner has been created. You can now edit the details.',
      });

    } catch (error: any) {
        console.error("Error adding new practitioner:", error);
        if (error.code === 'permission-denied') {
            toast({
              variant: 'destructive',
              title: 'Action Failed',
              description: PERMISSION_ERROR_MESSAGE,
            });
        } else {
            toast({
              variant: 'destructive',
              title: 'Error Adding Practitioner',
              description: error.message || 'An unexpected error occurred.',
            });
        }
    }
  };

  const handleSaveOrder = async (itemsToSave: PractitionerItem[]) => {
    if (!firestore || !user) return;

    try {
      await user.getIdToken(true);
      
      const batch = writeBatch(firestore);
      itemsToSave.forEach((item, index) => {
        const docRef = doc(firestore, 'practitioners', item.id);
        batch.update(docRef, { sortOrder: index });
      });

      await batch.commit();
      toast({
        title: 'Order Saved',
        description: 'The new order of practitioners has been saved.',
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
          <h2 className="text-2xl font-bold font-headline">Practitioner List</h2>
          <p className="text-muted-foreground">
            Manage the practitioners (speakers) featured on your website.
          </p>
        </div>
        <Button onClick={handleAddNewPractitioner} disabled={isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Practitioner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Practitioners</CardTitle>
          <CardDescription>
            Add, edit, delete, and reorder practitioners. Drag the handle to reorder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : practitioners && practitioners.length > 0 ? (
            <DraggablePractitionerList
              items={practitioners}
              onOrderSave={handleSaveOrder}
            />
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No practitioners found.</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={handleAddNewPractitioner}
              >
                Add the first practitioner
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- DRAGGABLE LIST COMPONENT ---
interface DraggablePractitionerListProps {
  items: PractitionerItem[];
  onOrderSave: (items: PractitionerItem[]) => void;
}

function DraggablePractitionerList({ items, onOrderSave }: DraggablePractitionerListProps) {
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
          <PractitionerItemForm item={item} />
        </div>
      ))}
    </div>
  );
}

// --- FORM FOR A SINGLE PRACTITIONER ITEM ---
interface PractitionerItemFormProps {
  item: PractitionerItem;
}

function PractitionerItemForm({ item }: PractitionerItemFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const [formData, setFormData] = useState(item);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  const handleSelectChange = (value: PractitionerCategory) => {
    setFormData(prev => ({ ...prev, categoryName: value }));
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
        
        let dataToUpdate: Partial<PractitionerItem> = {
          name: formData.name,
          title: formData.title,
          categoryName: formData.categoryName,
        };
        
        if (newImageFile) {
            setIsUploading(true);
            const imageRef = ref(storage, `hero-images/Practitioner List/${item.id}_${newImageFile.name}`);
            const uploadTask = await uploadBytes(imageRef, newImageFile);
            const downloadURL = await getDownloadURL(uploadTask.ref);
            
            toast({ title: 'Image Uploaded' });
            dataToUpdate.imageUrl = downloadURL;
            setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
            setIsUploading(false);
        }

        const docRef = doc(firestore, 'practitioners', item.id);
        await updateDoc(docRef, { ...dataToUpdate });

        toast({ title: 'Practitioner Saved', description: 'Your changes have been saved.' });
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

      await deleteDoc(doc(firestore, 'practitioners', item.id));

      toast({
        title: 'Practitioner Deleted',
        description: 'The practitioner has been successfully removed.',
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
                title: 'Error Deleting Practitioner',
                description: error.message || 'An unexpected error occurred during deletion.',
            });
        }
    }
  };

  const totalLoading = isSaving || isUploading;
  const imageUrlToPreview = uploadPreviewUrl || formData.imageUrl;
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(item) || newImageFile;

  return (
    <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <div className="space-y-4 md:col-span-1">
        <Label>Photo Preview</Label>
        <Image
          key={imageUrlToPreview}
          src={imageUrlToPreview || 'https://placehold.co/300x400/e2e8f0/e2e8f0?text=No+Image'}
          alt={item.name || "Practitioner photo"}
          width={300}
          height={400}
          className={cn(
            "rounded-md object-cover bg-muted aspect-[3/4] w-full",
            uploadPreviewUrl && "ring-2 ring-primary"
          )}
          unoptimized
        />
         <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-full"
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

      <div className="space-y-4 md:col-span-2">
        <div className="space-y-2">
            <Label htmlFor={`name-${item.id}`}>Practitioner Name</Label>
            <Input
                id={`name-${item.id}`}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={totalLoading}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor={`title-${item.id}`}>Title / Position</Label>
            <Input
                id={`title-${item.id}`}
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={totalLoading}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor={`categoryName-${item.id}`}>Category</Label>
            <Select onValueChange={handleSelectChange} value={formData.categoryName}>
                <SelectTrigger id={`categoryName-${item.id}`} disabled={totalLoading}>
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {CATEGORIES.map(cat => {
                        const details = categoryDetailsMap[cat];
                        const Icon = details.icon;
                        return (
                            <SelectItem key={cat} value={cat}>
                                <div className="flex items-center gap-2">
                                    <div style={{ backgroundColor: details.color }} className="w-2 h-2 rounded-full" />
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    <span>{cat}</span>
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
        
        <div className="flex justify-end items-center gap-2 pt-4">
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
                  This action cannot be undone. This will permanently delete the practitioner.
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
          <Button onClick={handleSave} size="sm" disabled={totalLoading || !hasChanges}>
            {isUploading ? 'Uploading...' : isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
