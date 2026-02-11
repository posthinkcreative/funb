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

interface WebsiteSetting {
  introTitle?: string;
  introDescription?: string;
}

const SETTINGS_DOC_ID = 'main';
const PERMISSION_ERROR_MESSAGE = "Permission denied. Please ensure your account has 'admin' privileges and your session is active.";

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
            description: 'The homepage intro content has been saved.',
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
            Edit the main title and description on the homepage.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Intro Content</CardTitle>
          <CardDescription>
            This content appears below the main hero carousel. Use new lines in the text boxes for line breaks.
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
                    <Label htmlFor="intro-title">Title</Label>
                    <Textarea
                        id="intro-title"
                        placeholder="Unlock Your Potential..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        rows={3}
                        disabled={isSaving}
                    />
                </div>
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="intro-description">Description</Label>
                    <Textarea
                        id="intro-description"
                        placeholder="Our AI-powered platform provides..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
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

    