'use client';

import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Copyright, LayoutPanelLeft } from 'lucide-react';

interface WebsiteSetting {
  footerBrandTitle?: string;
  footerBrandSubtitle?: string;
  footerFacebook?: string;
  footerInstagram?: string;
  footerTwitter?: string;
  footerYoutube?: string;
  footerLinkedin?: string;
  footerCopyright?: string;
  // Visibility toggles
  showFacebook?: boolean;
  showInstagram?: boolean;
  showTwitter?: boolean;
  showYoutube?: boolean;
  showLinkedin?: boolean;
}

const SETTINGS_DOC_ID = 'main';
const PERMISSION_ERROR_MESSAGE = "Permission denied. Please ensure your account has 'admin' privileges.";

export default function AdminFooterSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();

  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'website_settings', SETTINGS_DOC_ID);
  }, [firestore]);

  const { data: settings, isLoading: isLoadingSettings } = useDoc<WebsiteSetting>(settingsDocRef);

  const [formData, setFormData] = useState<WebsiteSetting>({
    footerBrandTitle: '',
    footerBrandSubtitle: '',
    footerFacebook: '',
    footerInstagram: '',
    footerTwitter: '',
    footerYoutube: '',
    footerLinkedin: '',
    footerCopyright: '',
    showFacebook: true,
    showInstagram: true,
    showTwitter: true,
    showYoutube: true,
    showLinkedin: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        footerBrandTitle: settings.footerBrandTitle || '',
        footerBrandSubtitle: settings.footerBrandSubtitle || '',
        footerFacebook: settings.footerFacebook || '',
        footerInstagram: settings.footerInstagram || '',
        footerTwitter: settings.footerTwitter || '',
        footerYoutube: settings.footerYoutube || '',
        footerLinkedin: settings.footerLinkedin || '',
        footerCopyright: settings.footerCopyright || '',
        showFacebook: settings.showFacebook ?? true,
        showInstagram: settings.showInstagram ?? true,
        showTwitter: settings.showTwitter ?? true,
        showYoutube: settings.showYoutube ?? true,
        showLinkedin: settings.showLinkedin ?? true,
      });
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name: keyof WebsiteSetting, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
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
            title: 'Footer Settings Updated',
            description: 'Footer content and social links have been saved successfully.',
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

  const hasChanges = settings 
    ? (formData.footerBrandTitle !== (settings.footerBrandTitle || '')) ||
      (formData.footerBrandSubtitle !== (settings.footerBrandSubtitle || '')) ||
      (formData.footerFacebook !== (settings.footerFacebook || '')) || 
      (formData.footerInstagram !== (settings.footerInstagram || '')) || 
      (formData.footerTwitter !== (settings.footerTwitter || '')) || 
      (formData.footerYoutube !== (settings.footerYoutube || '')) || 
      (formData.footerLinkedin !== (settings.footerLinkedin || '')) || 
      (formData.footerCopyright !== (settings.footerCopyright || '')) ||
      (formData.showFacebook !== (settings.showFacebook ?? true)) ||
      (formData.showInstagram !== (settings.showInstagram ?? true)) ||
      (formData.showTwitter !== (settings.showTwitter ?? true)) ||
      (formData.showYoutube !== (settings.showYoutube ?? true)) ||
      (formData.showLinkedin !== (settings.showLinkedin ?? true))
    : Object.values(formData).some(val => val !== '' && val !== true);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-headline">Footer Management</h2>
          <p className="text-muted-foreground">
            Edit brand information, social media links, and copyright for the website footer.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Brand Information</CardTitle>
                    <CardDescription>Teks yang muncul di sebelah kiri atas footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoadingSettings ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : (
                        <>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="footerBrandTitle" className="flex items-center gap-2">
                                    <LayoutPanelLeft className="w-4 h-4" /> Judul Brand
                                </Label>
                                <Input
                                    id="footerBrandTitle"
                                    name="footerBrandTitle"
                                    placeholder="Contoh: FunB"
                                    value={formData.footerBrandTitle}
                                    onChange={handleInputChange}
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="footerBrandSubtitle">Deskripsi Singkat</Label>
                                <Textarea
                                    id="footerBrandSubtitle"
                                    name="footerBrandSubtitle"
                                    placeholder="Contoh: Unlock your potential with our AI-powered learning platform."
                                    value={formData.footerBrandSubtitle}
                                    onChange={handleInputChange}
                                    disabled={isSaving}
                                    rows={3}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                    <CardDescription>Atur URL dan aktifkan media sosial yang ingin ditampilkan di footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoadingSettings ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : (
                        <>
                            {/* Facebook */}
                            <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="footerFacebook" className="flex items-center gap-2 cursor-pointer">
                                        <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{formData.showFacebook ? 'Visible' : 'Hidden'}</span>
                                        <Switch 
                                            checked={formData.showFacebook} 
                                            onCheckedChange={(checked) => handleToggleChange('showFacebook', checked)}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>
                                <Input
                                    id="footerFacebook"
                                    name="footerFacebook"
                                    placeholder="https://facebook.com/yourpage"
                                    value={formData.footerFacebook}
                                    onChange={handleInputChange}
                                    disabled={isSaving || !formData.showFacebook}
                                    className="h-8 text-sm"
                                />
                            </div>

                            {/* Instagram */}
                            <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="footerInstagram" className="flex items-center gap-2 cursor-pointer">
                                        <Instagram className="w-4 h-4 text-pink-600" /> Instagram
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{formData.showInstagram ? 'Visible' : 'Hidden'}</span>
                                        <Switch 
                                            checked={formData.showInstagram} 
                                            onCheckedChange={(checked) => handleToggleChange('showInstagram', checked)}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>
                                <Input
                                    id="footerInstagram"
                                    name="footerInstagram"
                                    placeholder="https://instagram.com/yourprofile"
                                    value={formData.footerInstagram}
                                    onChange={handleInputChange}
                                    disabled={isSaving || !formData.showInstagram}
                                    className="h-8 text-sm"
                                />
                            </div>

                            {/* Twitter */}
                            <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="footerTwitter" className="flex items-center gap-2 cursor-pointer">
                                        <Twitter className="w-4 h-4 text-sky-500" /> Twitter / X
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{formData.showTwitter ? 'Visible' : 'Hidden'}</span>
                                        <Switch 
                                            checked={formData.showTwitter} 
                                            onCheckedChange={(checked) => handleToggleChange('showTwitter', checked)}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>
                                <Input
                                    id="footerTwitter"
                                    name="footerTwitter"
                                    placeholder="https://twitter.com/yourhandle"
                                    value={formData.footerTwitter}
                                    onChange={handleInputChange}
                                    disabled={isSaving || !formData.showTwitter}
                                    className="h-8 text-sm"
                                />
                            </div>

                            {/* Youtube */}
                            <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="footerYoutube" className="flex items-center gap-2 cursor-pointer">
                                        <Youtube className="w-4 h-4 text-red-600" /> YouTube
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{formData.showYoutube ? 'Visible' : 'Hidden'}</span>
                                        <Switch 
                                            checked={formData.showYoutube} 
                                            onCheckedChange={(checked) => handleToggleChange('showYoutube', checked)}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>
                                <Input
                                    id="footerYoutube"
                                    name="footerYoutube"
                                    placeholder="https://youtube.com/c/yourchannel"
                                    value={formData.footerYoutube}
                                    onChange={handleInputChange}
                                    disabled={isSaving || !formData.showYoutube}
                                    className="h-8 text-sm"
                                />
                            </div>

                            {/* Linkedin */}
                            <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="footerLinkedin" className="flex items-center gap-2 cursor-pointer">
                                        <Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{formData.showLinkedin ? 'Visible' : 'Hidden'}</span>
                                        <Switch 
                                            checked={formData.showLinkedin} 
                                            onCheckedChange={(checked) => handleToggleChange('showLinkedin', checked)}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>
                                <Input
                                    id="footerLinkedin"
                                    name="footerLinkedin"
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    value={formData.footerLinkedin}
                                    onChange={handleInputChange}
                                    disabled={isSaving || !formData.showLinkedin}
                                    className="h-8 text-sm"
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Copyright Info</CardTitle>
                    <CardDescription>Teks yang akan muncul di bagian paling bawah footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoadingSettings ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="footerCopyright" className="flex items-center gap-2">
                                <Copyright className="w-4 h-4" /> Copyright Text
                            </Label>
                            <Input
                                id="footerCopyright"
                                name="footerCopyright"
                                placeholder="© 2025 FunB. All rights reserved."
                                value={formData.footerCopyright}
                                onChange={handleInputChange}
                                disabled={isSaving}
                            />
                        </div>
                    )}
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
                {hasChanges && <p className="text-[10px] text-center text-amber-600 font-medium italic">Ada perubahan yang belum disimpan</p>}
            </div>
        </div>
      </div>
    </div>
  );
}
