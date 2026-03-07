
'use client';

import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';

interface WebsiteSetting {
  introTitle?: string;
  introDescription?: string;
}

const SETTINGS_DOC_ID = 'main';
const PERMISSION_ERROR_MESSAGE = "Permission denied. Please ensure your account has 'admin' privileges.";

export default function AdminIntroPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();

  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'website_settings', SETTINGS_DOC_ID);
  }, [firestore]);

  const { data: settings, isLoading: isLoadingSettings } = useDoc<WebsiteSetting>(settingsDocRef);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setTitle(settings.introTitle || '');
      setDescription(settings.introDescription || '');
    }
  }, [settings]);

  const handleSave = async () => {
    if (!firestore || !user) return;

    try {
        await user.getIdToken(true);
        setIsSaving(true);
        
        await setDoc(doc(firestore, 'website_settings', SETTINGS_DOC_ID), {
            introTitle: title,
            introDescription: description,
        }, { merge: true });

        toast({
            title: 'Intro Section Updated',
            description: 'Homepage intro content has been saved successfully.',
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

  const hasChanges = settings ? (title !== (settings.introTitle || '')) || (description !== (settings.introDescription || '')) : (title !== '' || description !== '');

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-headline">Homepage Intro Section</h2>
          <p className="text-muted-foreground">
            Edit teks utama yang muncul tepat di bawah banner homepage.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Intro Content</CardTitle>
          <CardDescription>
            Gunakan baris baru (Enter) jika Anda ingin teks terputus di titik tertentu pada tampilan depan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingSettings ? (
            <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
          ) : (
             <div className="space-y-6">
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="intro-title">Judul Utama</Label>
                    <Textarea
                        id="intro-title"
                        placeholder="Contoh: Unlock Your Potential with EduBoost"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        rows={3}
                        className="text-lg font-bold"
                        disabled={isSaving}
                    />
                </div>
                <div className="grid w-full gap-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="intro-description">Deskripsi</Label>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            <Info className="w-3 h-3" />
                            <span>Mendukung teks multi-baris.</span>
                        </div>
                    </div>
                    <Textarea
                        id="intro-description"
                        placeholder="Tuliskan deskripsi singkat platform Anda..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={8}
                        className="text-base"
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
