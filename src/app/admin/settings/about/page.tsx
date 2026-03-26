'use client';

import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser, useStorage } from '@/firebase';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Info, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface WebsiteSetting {
  aboutUsTitle?: string;
  aboutUsContent?: string;
  aboutUsImages?: string[];
}

const SETTINGS_DOC_ID = 'main';
const PERMISSION_ERROR_MESSAGE = "Permission denied. Please ensure your account has 'admin' privileges.";

export default function AdminAboutPage() {
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'website_settings', SETTINGS_DOC_ID);
  }, [firestore]);

  const { data: settings, isLoading: isLoadingSettings } = useDoc<WebsiteSetting>(settingsDocRef);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setTitle(settings.aboutUsTitle || '');
      setContent(settings.aboutUsContent || '');
      setImages(settings.aboutUsImages || []);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!firestore || !user) return;

    try {
        await user.getIdToken(true);
        setIsSaving(true);
        
        await setDoc(doc(firestore, 'website_settings', SETTINGS_DOC_ID), {
            aboutUsTitle: title,
            aboutUsContent: content,
            aboutUsImages: images,
        }, { merge: true });

        toast({
            title: 'About Us Section Updated',
            description: 'The about us page content has been saved successfully.',
        });

    } catch(error: any) {
        console.error("Save Error:", error);
        const desc = error.code === 'permission-denied' ? PERMISSION_ERROR_MESSAGE : error.message;
        toast({
            variant: 'destructive',
            title: 'Error Saving Data',
            description: desc,
        });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !storage || !user) return;

    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
        toast({
            variant: 'destructive',
            title: 'Invalid file type',
            description: 'Please upload an image file.',
        });
        return;
    }

    try {
        setIsUploading(true);
        const storageRef = ref(storage, `hero-images/about-us/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        setImages(prev => [...prev, downloadURL]);
        toast({
            title: 'Image uploaded',
            description: 'Photo has been added to the gallery.',
        });
    } catch (error: any) {
        console.error("Upload error:", error);
        toast({
            variant: 'destructive',
            title: 'Upload failed',
            description: error.message,
        });
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = async (urlToRemove: string) => {
    // We only remove from the state here. 
    // In a production app, you might want to also delete the object from Storage if it's no longer used.
    // For simplicity in this demo, we'll just update the Firestore array on Save.
    setImages(prev => prev.filter(url => url !== urlToRemove));
    
    // Optional: Attempt to delete from storage if it's our own bucket
    if (urlToRemove.includes('firebasestorage.googleapis.com')) {
        try {
            const storageRef = ref(storage, urlToRemove);
            await deleteObject(storageRef);
        } catch (e) {
            console.error("Could not delete from storage, might already be gone:", e);
        }
    }
  };

  const hasChanges = settings 
    ? (title !== (settings.aboutUsTitle || '')) || 
      (content !== (settings.aboutUsContent || '')) || 
      (JSON.stringify(images) !== JSON.stringify(settings.aboutUsImages || []))
    : (title !== '' || content !== '' || images.length > 0);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-headline">About Us Management</h2>
          <p className="text-muted-foreground">
            Edit titles, stories, and manage the photo gallery for the About Us page.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Page Content</CardTitle>
                <CardDescription>
                    Teks yang Anda masukkan di sini akan tampil dengan format yang sama pada halaman /about-us.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                {isLoadingSettings ? (
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="about-title">Judul Halaman</Label>
                            <Input
                                id="about-title"
                                placeholder="Contoh: Tentang EduBoost"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="grid w-full gap-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="about-content">Konten Utama</Label>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                    <Info className="w-3 h-3" />
                                    <span>Gunakan 'Enter' untuk membuat baris baru.</span>
                                </div>
                            </div>
                            <Textarea
                                id="about-content"
                                placeholder="Tuliskan cerita tentang EduBoost di sini..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={15}
                                className="font-sans text-base leading-relaxed resize-y"
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>

        <div className="xl:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Photo Gallery</CardTitle>
                    <CardDescription>Tambahkan beberapa foto untuk mempercantik halaman About Us.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div 
                        className={cn(
                            "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:bg-muted/50",
                            isUploading && "pointer-events-none opacity-50"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="text-sm font-medium">Uploading...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Upload className="w-8 h-8" />
                                <p className="text-sm font-medium">Click to upload photo</p>
                                <p className="text-xs">PNG, JPG up to 5MB</p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileUpload}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            <span>Gallery Images ({images.length})</span>
                        </Label>
                        
                        {images.length === 0 ? (
                            <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                                <p className="text-xs text-muted-foreground">No photos added yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {images.map((url, idx) => (
                                    <div key={idx} className="group relative aspect-square rounded-md overflow-hidden border bg-muted">
                                        <Image 
                                            src={url} 
                                            alt={`Gallery ${idx}`} 
                                            fill 
                                            className="object-cover"
                                            unoptimized
                                        />
                                        <button 
                                            onClick={() => removeImage(url)}
                                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving || isLoadingSettings}
                    size="lg"
                    className="w-full"
                >
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
                {hasChanges && <p className="text-[10px] text-center text-amber-600 font-medium">Ada perubahan yang belum disimpan</p>}
            </div>
        </div>
      </div>
    </div>
  );
}
