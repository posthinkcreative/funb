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
import { Input } from '@/components/ui/input';

interface WebsiteSetting {
  bootcampTitle?: string;
  bootcampSubtitle?: string;
  practitionersTitle?: string;
  testimonialsTitle?: string;
}

const SETTINGS_DOC_ID = 'main';
const PERMISSION_ERROR_MESSAGE = "Permission denied. Please ensure your account has 'admin' privileges and your session is active.";

export default function AdminTitlesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();

  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'website_settings', SETTINGS_DOC_ID);
  }, [firestore]);

  const { data: settings, isLoading: isLoadingSettings } = useDoc<WebsiteSetting>(settingsDocRef);

  const [formData, setFormData] = useState<WebsiteSetting>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        bootcampTitle: settings.bootcampTitle || '',
        bootcampSubtitle: settings.bootcampSubtitle || '',
        practitionersTitle: settings.practitionersTitle || '',
        testimonialsTitle: settings.testimonialsTitle || '',
      });
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!firestore || !user) return;

    try {
        await user.getIdToken(true);
        setIsSaving(true);
        
        await setDoc(doc(firestore, 'website_settings', SETTINGS_DOC_ID), {
            ...formData
        }, { merge: true });

        toast({
            title: 'Section Titles Updated',
            description: 'The homepage section titles have been saved.',
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

  const hasChanges = settings ? JSON.stringify(formData) !== JSON.stringify({
    bootcampTitle: settings.bootcampTitle || '',
    bootcampSubtitle: settings.bootcampSubtitle || '',
    practitionersTitle: settings.practitionersTitle || '',
    testimonialsTitle: settings.testimonialsTitle || '',
  }) : Object.values(formData).some(val => val !== '');


  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
          <h2 className="text-2xl font-bold font-headline">Homepage Section Titles</h2>
          <p className="text-muted-foreground">
            Edit the titles for various sections on the homepage.
          </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section Titles</CardTitle>
          <CardDescription>
            This content appears on the homepage. Use simple text for these fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingSettings ? (
            <div className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
          ) : (
             <div className="space-y-6">
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="bootcampTitle">Bootcamp Section Title</Label>
                    <Input
                        id="bootcampTitle"
                        name="bootcampTitle"
                        placeholder='e.g., FUN-B 3rd Bootcamp 2025'
                        value={formData.bootcampTitle || ''}
                        onChange={handleInputChange}
                        disabled={isSaving}
                    />
                </div>
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="bootcampSubtitle">Bootcamp Section Subtitle</Label>
                    <Input
                        id="bootcampSubtitle"
                        name="bootcampSubtitle"
                        placeholder='e.g., "Scale & Grow Your Soul Of Beautypreneur"'
                        value={formData.bootcampSubtitle || ''}
                        onChange={handleInputChange}
                        disabled={isSaving}
                    />
                </div>
                 <div className="grid w-full gap-1.5">
                    <Label htmlFor="practitionersTitle">Practitioners Section Title</Label>
                    <Textarea
                        id="practitionersTitle"
                        name="practitionersTitle"
                        placeholder="e.g., Engage in Live Lessons with Top Practitioners..."
                        value={formData.practitionersTitle || ''}
                        onChange={handleInputChange}
                        rows={3}
                        disabled={isSaving}
                    />
                </div>
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="testimonialsTitle">Testimonials Section Title</Label>
                    <Textarea
                        id="testimonialsTitle"
                        name="testimonialsTitle"
                        placeholder="e.g., Connect with Alumni Who've Walked Your Path!"
                        value={formData.testimonialsTitle || ''}
                        onChange={handleInputChange}
                        rows={3}
                        disabled={isSaving}
                    />
                </div>
             </div>
          )}
          
          <div className="flex justify-end pt-6 border-t mt-6">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving || isLoadingSettings}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
