"use client";

import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from "./ui/skeleton";

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

export default function SiteFooter() {
  const [isMounted, setIsMounted] = useState(false);
  const currentYear = new Date().getFullYear();
  const firestore = useFirestore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'website_settings', SETTINGS_DOC_ID);
  }, [firestore]);

  const { data: settings, isLoading } = useDoc<WebsiteSetting>(settingsDocRef);

  if (!isMounted) {
    // Render nothing on server to avoid hydration mismatch
    return null;
  }

  const brandTitle = settings?.footerBrandTitle || "FunB";
  const brandSubtitle = settings?.footerBrandSubtitle || "Unlock your potential with our AI-powered learning platform.";
  const copyright = settings?.footerCopyright || `© ${currentYear} FunB. All rights reserved.`;

  // Social Links with visibility check
  const socialLinks = [
    { icon: Facebook, href: settings?.footerFacebook, show: settings?.showFacebook ?? true },
    { icon: Instagram, href: settings?.footerInstagram, show: settings?.showInstagram ?? true },
    { icon: Twitter, href: settings?.footerTwitter, show: settings?.showTwitter ?? true },
    { icon: Youtube, href: settings?.footerYoutube, show: settings?.showYoutube ?? true },
    { icon: Linkedin, href: settings?.footerLinkedin, show: settings?.showLinkedin ?? true },
  ].filter(link => link.show && link.href && link.href.trim() !== '');

  return (
    <footer 
      className={cn(
        "relative border-t bg-cover bg-center bg-no-repeat",
        "bg-[url('/footer.jpg')]"
      )}
    >
      {/* Overlay to ensure readability if image is dark/light */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8 text-white">
          <div className="col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
                <span className="text-2xl font-bold font-headline text-white">{brandTitle}</span>
            </Link>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 bg-white/20" />
                <Skeleton className="h-4 w-32 bg-white/20" />
              </div>
            ) : (
              <div className="text-white/90 text-sm max-w-xs space-y-1">
                <p className="font-semibold text-base">{brandTitle}</p>
                <p className="italic opacity-80">{brandSubtitle}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {socialLinks.length > 0 && (
              <div>
                <h3 className="font-headline font-semibold mb-4 text-white uppercase tracking-wider text-sm">Follow Us</h3>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map((social, idx) => (
                    <a 
                      key={idx} 
                      href={social.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white/10 hover:bg-accent transition-colors duration-300"
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-12 border-t border-white/20 pt-8 text-center text-xs text-white/60 tracking-wide">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
