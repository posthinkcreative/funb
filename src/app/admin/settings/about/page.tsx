
'use client';

import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';

interface WebsiteSetting {
  aboutUsTitle?: string;
  aboutUsContent?: string;
}

const SETTINGS_DOC_ID = 'main';
const PERMISSION_ERROR_MESSAGE = "Permission denied. Please ensure your account has 'admin' privileges.";

export default function AdminAboutPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();

  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'website_settings', SETTINGS_DOC_ID);
  }, [firestore]);

  const { data: settings, isLoading: isLoadingSettings } = useDoc<WebsiteSetting>(settingsDocRef);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setTitle(settings.aboutUsTitle || '');
      setContent(settings.aboutUsContent || '');
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

  const hasChanges = settings ? (title !== (settings.aboutUsTitle || '')) || (content !== (settings.aboutUsContent || '')) : (title !== '' || content !== '');

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-headline">About Us Management</h2>
          <p className="text-muted-foreground">
            Edit the information displayed on the public About Us page.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Content</CardTitle>
          <CardDescription>
            Teks yang Anda masukkan di sini akan tampil dengan format yang sama (termasuk baris baru) pada halaman /about-us.
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
                            <span>Gunakan 'Enter' untuk membuat baris baru atau paragraf.</span>
                        </div>
                    </div>
                    <Textarea
                        id="about-content"
                        placeholder="Tuliskan cerita tentang EduBoost di sini..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={20}
                        className="font-sans text-base leading-relaxed resize-y"
                        disabled={isSaving}
                    />
                </div>
             </div>
          )}
          
          <div className="flex justify-end pt-6 border-t mt-6">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving || isLoadingSettings}
                size="lg"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
