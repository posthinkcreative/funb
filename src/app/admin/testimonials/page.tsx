

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
import type { AlumniTestimonial } from '@/types';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';

type TestimonialItem = AlumniTestimonial & { id: string };

const PERMISSION_ERROR_MESSAGE = "Permission denied. Please ensure your account has 'admin' privileges and your session is active.";

export default function AdminTestimonialsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();

  const testimonialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'alumniTestimonials'), orderBy('sortOrder', 'asc'));
  }, [firestore]);

  const { data: testimonials, isLoading } = useCollection<AlumniTestimonial>(testimonialsQuery);

  const handleAddNewTestimonial = async () => {
    if (!firestore || !user) return;
    
    try {
      await user.getIdToken(true);
      
      const newTestimonialPayload = {
        name: `Alumni Name ${testimonials ? testimonials.length + 1 : 1}`,
        batch: 'Alumni Batch',
        avatarUrl: `https://placehold.co/80x80/e2e8f0/e2e8f0?text=New`,
        bgColor: '#8b5cf6',
        before: {
          role: 'Previous Role',
          university: 'Previous University/Company',
        },
        after: {
          role: 'Current Role',
          company: 'Current Company',
          companyLogoUrl: 'https://placehold.co/100x40/e2e8f0/e2e8f0?text=Logo',
        },
        sortOrder: testimonials && testimonials.length > 0 ? Math.max(...testimonials.map(item => item.sortOrder)) + 1 : 0,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(firestore, 'alumniTestimonials'), newTestimonialPayload);
      
      toast({
        title: 'Testimonial Added',
        description: 'A new testimonial has been created. You can now edit the details.',
      });

    } catch (error: any) {
        console.error("Error adding new testimonial:", error);
        if (error.code === 'permission-denied') {
            toast({
              variant: 'destructive',
              title: 'Action Failed',
              description: PERMISSION_ERROR_MESSAGE,
            });
        } else {
            toast({
              variant: 'destructive',
              title: 'Error Adding Testimonial',
              description: error.message || 'An unexpected error occurred.',
            });
        }
    }
  };

  const handleSaveOrder = async (itemsToSave: TestimonialItem[]) => {
    if (!firestore || !user) return;

    try {
      await user.getIdToken(true);
      
      const batch = writeBatch(firestore);
      itemsToSave.forEach((item, index) => {
        const docRef = doc(firestore, 'alumniTestimonials', item.id);
        batch.update(docRef, { sortOrder: index });
      });

      await batch.commit();
      toast({
        title: 'Order Saved',
        description: 'The new order of testimonials has been saved.',
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
          <h2 className="text-2xl font-bold font-headline">Edit Testimonials</h2>
          <p className="text-muted-foreground">
            Manage the alumni testimonials featured on your website.
          </p>
        </div>
        <Button onClick={handleAddNewTestimonial} disabled={isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Testimonials</CardTitle>
          <CardDescription>
            Add, edit, delete, and reorder testimonials. Drag the handle to reorder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : testimonials && testimonials.length > 0 ? (
            <DraggableTestimonialList
              items={testimonials}
              onOrderSave={handleSaveOrder}
            />
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No testimonials found.</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={handleAddNewTestimonial}
              >
                Add the first testimonial
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- DRAGGABLE LIST COMPONENT ---
interface DraggableTestimonialListProps {
  items: TestimonialItem[];
  onOrderSave: (items: TestimonialItem[]) => void;
}

function DraggableTestimonialList({ items, onOrderSave }: DraggableTestimonialListProps) {
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
          <TestimonialItemForm item={item} />
        </div>
      ))}
    </div>
  );
}

// --- FORM FOR A SINGLE TESTIMONIAL ITEM ---
interface TestimonialItemFormProps {
  item: TestimonialItem;
}

function TestimonialItemForm({ item }: TestimonialItemFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  
  const PRESET_COLORS = ['#8b5cf6', '#db2777', '#f97316', '#2563eb', '#16a34a', '#f59e0b'];


  const [formData, setFormData] = useState(item);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(item);
    setNewAvatarFile(null);
    setAvatarPreviewUrl(null);
    setNewLogoFile(null);
    setLogoPreviewUrl(null);
  }, [item]);
  
  useEffect(() => {
    return () => {
        if (avatarPreviewUrl && avatarPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(avatarPreviewUrl);
        if (logoPreviewUrl && logoPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(logoPreviewUrl);
    }
  }, [avatarPreviewUrl, logoPreviewUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    if (keys.length > 1) {
        setFormData(prev => ({ ...prev, [keys[0]]: { ...prev[keys[0] as 'before' | 'after'], [keys[1]]: value } }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'logo') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'avatar') {
        setNewAvatarFile(file);
        if (avatarPreviewUrl && avatarPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl(URL.createObjectURL(file));
      } else {
        setNewLogoFile(file);
        if (logoPreviewUrl && logoPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(logoPreviewUrl);
        setLogoPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleSave = async () => {
    if (!firestore || !storage || !user) return;
    
    try {
        await user.getIdToken(true);
        setIsSaving(true);
        
        const dataToUpdate: Partial<AlumniTestimonial> & {before: any, after: any} = {
            name: formData.name,
            batch: formData.batch,
            bgColor: formData.bgColor,
            before: { ...formData.before },
            after: { ...formData.after },
        };
        
        if (newAvatarFile) {
            setIsUploadingAvatar(true);
            const imageRef = ref(storage, `hero-images/Profile Testimonial/${item.id}_${newAvatarFile.name}`);
            const uploadResult = await uploadBytes(imageRef, newAvatarFile);
            const downloadURL = await getDownloadURL(uploadResult.ref);
            dataToUpdate.avatarUrl = downloadURL;
            setFormData(prev => ({ ...prev, avatarUrl: downloadURL }));
            setIsUploadingAvatar(false);
        }

        if (newLogoFile) {
            setIsUploadingLogo(true);
            const imageRef = ref(storage, `hero-images/Logo Pekerjaan/${item.id}_${newLogoFile.name}`);
            const uploadResult = await uploadBytes(imageRef, newLogoFile);
            const downloadURL = await getDownloadURL(uploadResult.ref);
            dataToUpdate.after.companyLogoUrl = downloadURL;
            setFormData(prev => ({ ...prev, after: { ...prev.after, companyLogoUrl: downloadURL } }));
            setIsUploadingLogo(false);
        }

        const docRef = doc(firestore, 'alumniTestimonials', item.id);
        await updateDoc(docRef, dataToUpdate);

        toast({ title: 'Testimonial Saved' });
        setNewAvatarFile(null);
        setAvatarPreviewUrl(null);
        setNewLogoFile(null);
        setLogoPreviewUrl(null);
    } catch(error: any) {
        console.error("Save Error:", error);
        toast({ variant: 'destructive', title: 'Error Saving Data', description: error.message });
    } finally {
      setIsSaving(false);
      setIsUploadingAvatar(false);
      setIsUploadingLogo(false);
    }
  };

  const handleDelete = async () => {
    if (!firestore || !storage || !user) return;

    try {
      await user.getIdToken(true);
      
      const deleteImage = async (imageUrl: string) => {
        if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
          try {
            await deleteObject(ref(storage, imageUrl));
          } catch (storageError: any) {
            if (storageError.code !== 'storage/object-not-found') throw storageError;
          }
        }
      };

      await Promise.all([deleteImage(item.avatarUrl), deleteImage(item.after.companyLogoUrl)]);
      await deleteDoc(doc(firestore, 'alumniTestimonials', item.id));
      toast({ title: 'Testimonial Deleted' });

    } catch (error: any) {
        console.error("Deletion Error:", error);
        const description = error.code === 'permission-denied' ? PERMISSION_ERROR_MESSAGE : error.message;
        toast({ variant: 'destructive', title: 'Delete Failed', description });
    }
  };

  const totalLoading = isSaving || isUploadingAvatar || isUploadingLogo;
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(item) || newAvatarFile || newLogoFile;

  return (
    <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Column 1 & 2: Main Info */}
      <div className="space-y-6 lg:col-span-2">
        {/* Name & Batch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label htmlFor={`name-${item.id}`}>Alumni Name</Label>
              <Input id={`name-${item.id}`} name="name" value={formData.name} onChange={handleInputChange} disabled={totalLoading} />
          </div>
          <div className="space-y-2">
              <Label htmlFor={`batch-${item.id}`}>Batch</Label>
              <Input id={`batch-${item.id}`} name="batch" value={formData.batch} onChange={handleInputChange} disabled={totalLoading} />
          </div>
        </div>

        {/* Before & After */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
          <div className="space-y-4">
              <h4 className="font-medium text-lg">Before</h4>
              <div className="space-y-2">
                  <Label htmlFor={`before.role-${item.id}`}>Role</Label>
                  <Input id={`before.role-${item.id}`} name="before.role" value={formData.before.role} onChange={handleInputChange} disabled={totalLoading} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor={`before.university-${item.id}`}>University / Company</Label>
                  <Input id={`before.university-${item.id}`} name="before.university" value={formData.before.university} onChange={handleInputChange} disabled={totalLoading} />
              </div>
          </div>
           <div className="space-y-4">
              <h4 className="font-medium text-lg">After</h4>
              <div className="space-y-2">
                  <Label htmlFor={`after.role-${item.id}`}>Role</Label>
                  <Input id={`after.role-${item.id}`} name="after.role" value={formData.after.role} onChange={handleInputChange} disabled={totalLoading} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor={`after.company-${item.id}`}>Company</Label>
                  <Input id={`after.company-${item.id}`} name="after.company" value={formData.after.company} onChange={handleInputChange} disabled={totalLoading} />
              </div>
          </div>
        </div>
      </div>
      
      {/* Column 3: Images, Color & Actions */}
      <div className="space-y-6 lg:col-span-1">
        <div className="grid grid-cols-2 gap-4 items-start">
            <div className="space-y-2">
                <Label>Avatar</Label>
                <Image src={avatarPreviewUrl || formData.avatarUrl} alt="Avatar" width={80} height={80} className={cn("rounded-full object-cover bg-muted w-20 h-20", avatarPreviewUrl && "ring-2 ring-primary")} unoptimized />
                <Button type="button" size="sm" variant="outline" onClick={() => avatarFileInputRef.current?.click()} disabled={totalLoading}>{isUploadingAvatar ? 'Uploading...': 'Choose'}</Button>
                <Input type="file" ref={avatarFileInputRef} onChange={(e) => handleFileSelect(e, 'avatar')} className="hidden" accept="image/*" disabled={totalLoading} />
            </div>
            <div className="space-y-2">
                <Label>Company Logo</Label>
                <Image src={logoPreviewUrl || formData.after.companyLogoUrl} alt="Company Logo" width={100} height={40} className={cn("rounded-md object-contain bg-muted w-24 h-10", logoPreviewUrl && "ring-2 ring-primary")} unoptimized />
                <Button type="button" size="sm" variant="outline" onClick={() => logoFileInputRef.current?.click()} disabled={totalLoading}>{isUploadingLogo ? 'Uploading...' : 'Choose'}</Button>
                <Input type="file" ref={logoFileInputRef} onChange={(e) => handleFileSelect(e, 'logo')} className="hidden" accept="image/*" disabled={totalLoading} />
            </div>
        </div>

        <div className="space-y-2 border-t pt-6">
          <Label htmlFor={`bgColor-${item.id}`}>Header Color</Label>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: formData.bgColor }} />
            <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">#</span>
                <Input
                    id={`bgColor-${item.id}`}
                    value={formData.bgColor.startsWith('#') ? formData.bgColor.substring(1) : formData.bgColor}
                    onChange={(e) => {
                        const hex = e.target.value.replace(/[^0-9a-fA-F]/g, '');
                        if (hex.length <= 6) {
                            setFormData(prev => ({ ...prev, bgColor: `#${hex}` }));
                        }
                    }}
                    onBlur={(e) => {
                         const hex = e.target.value.padStart(6, '0');
                         setFormData(prev => ({ ...prev, bgColor: `#${hex}` }));
                    }}
                    placeholder="8b5cf6"
                    disabled={totalLoading}
                    className="pl-7 font-mono"
                    maxLength={6}
                />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, bgColor: color }))}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  formData.bgColor === color ? 'ring-2 ring-offset-2 ring-ring' : 'border-transparent',
                  'hover:scale-110'
                )}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex justify-end items-center gap-2 pt-6 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive-outline" size="sm" disabled={totalLoading}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. This will permanently delete the testimonial.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSave} size="sm" disabled={totalLoading || !hasChanges}>
            {totalLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}

    

    
