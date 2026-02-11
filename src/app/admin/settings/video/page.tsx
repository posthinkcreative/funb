'use client';

import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useStorage, useUser } from '@/firebase';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

interface WebsiteSetting {
  bootcampVideoUrl: string;
}

const SETTINGS_DOC_ID = 'main';
const PERMISSION_ERROR_MESSAGE = "Permission denied. Please ensure your account has 'admin' privileges and your session is active.";

export default function AdminVideoPage() {
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const { user } = useUser();

  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'website_settings', SETTINGS_DOC_ID);
  }, [firestore]);

  const { data: settings, isLoading: isLoadingSettings } = useDoc<WebsiteSetting>(settingsDocRef);

  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (settings?.bootcampVideoUrl) {
      setPreviewUrl(settings.bootcampVideoUrl);
    }
  }, [settings]);

  useEffect(() => {
    // Revoke object URL on cleanup
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
        setNewVideoFile(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please select a valid video file.',
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!newVideoFile || !firestore || !storage || !user) return;

    try {
        await user.getIdToken(true); // Refresh token for permissions
        setIsUploading(true);
        setUploadProgress(0);

        // Use a working path inside 'hero-images' folder
        const videoRef = ref(storage, `hero-images/bootcamp-video/bootcamp-video.mp4`);
        const uploadTask = uploadBytesResumable(videoRef, newVideoFile);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload Error:", error);
                setIsUploading(false);
                 if (error.code === 'storage/unauthorized') {
                    toast({
                        variant: 'destructive',
                        title: 'Upload Failed',
                        description: PERMISSION_ERROR_MESSAGE,
                    });
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Error Uploading Video',
                        description: error.message || 'An unexpected error occurred.',
                    });
                }
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                await setDoc(doc(firestore, 'website_settings', SETTINGS_DOC_ID), {
                    bootcampVideoUrl: downloadURL
                }, { merge: true });

                toast({
                    title: 'Video Updated',
                    description: 'The new bootcamp video is now live.',
                    action: <CheckCircle className="text-green-500" />
                });
                
                setNewVideoFile(null);
                setIsUploading(false);
                setUploadProgress(0);
            }
        );

    } catch(error: any) {
        setIsUploading(false);
        console.error("Save Error:", error);
        if (error.code === 'permission-denied') {
             toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: PERMISSION_ERROR_MESSAGE,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error Saving Data',
                description: error.message || 'Could not save your changes.',
            });
        }
    }
  };

  const hasChanges = !!newVideoFile;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-headline">Bootcamp Video</h2>
          <p className="text-muted-foreground">
            Change the main video displayed on the homepage.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Bootcamp Video</CardTitle>
          <CardDescription>
            Upload a new video to replace the current one. The recommended aspect ratio is 16:9.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingSettings ? (
            <Skeleton className="aspect-video w-full max-w-2xl mx-auto rounded-lg" />
          ) : (
             <div className="w-full max-w-2xl mx-auto">
                {previewUrl ? (
                    <video
                      key={previewUrl}
                      ref={videoPreviewRef}
                      src={previewUrl}
                      controls
                      className="w-full aspect-video object-cover rounded-lg bg-muted"
                    >
                      Your browser does not support the video tag.
                    </video>
                ) : (
                    <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">No video has been set.</p>
                    </div>
                )}
             </div>
          )}
          
          <div className="w-full max-w-2xl mx-auto space-y-4">
             <div
                className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <UploadCloud className="w-12 h-12" />
                  <p className="font-semibold">
                    {newVideoFile ? "File selected:" : "Click or drag file to upload"}
                  </p>
                  <p className="text-sm">{newVideoFile ? newVideoFile.name : "Recommended: MP4, WebM"}</p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="video/mp4,video/webm"
                  disabled={isUploading}
                />
              </div>

              {isUploading && (
                <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-center text-muted-foreground">
                        Uploading... {Math.round(uploadProgress)}%
                    </p>
                </div>
              )}

              <Button
                size="lg"
                className="w-full"
                onClick={handleUpload}
                disabled={!hasChanges || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Save and Publish'}
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
