
"use client";

import { Facebook, Twitter, Instagram } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from "./ui/skeleton";

interface WebsiteSetting {
  bootcampTitle?: string;
  bootcampSubtitle?: string;
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

  const title = settings?.bootcampTitle || "FunB";
  const subtitle = settings?.bootcampSubtitle || "Unlock your potential with our AI-powered learning platform.";

  return (
    <footer 
      className={cn(
        "relative border-t bg-cover bg-center bg-no-repeat",
        "bg-[url('/footer.jpg')]"
      )}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
                <span className="text-xl font-bold font-headline text-white">FunB</span>
            </Link>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 bg-white/20" />
                <Skeleton className="h-4 w-32 bg-white/20" />
              </div>
            ) : (
              <div className="text-white/80 text-sm max-w-xs space-y-1">
                <p className="font-semibold">{title}</p>
                <p className="italic">{subtitle}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            <div className="col-span-1">
              <h3 className="font-headline font-semibold mb-4 text-white">Follow Us</h3>
              <div className="flex space-x-4">
                <Link href="#" className="text-white/80 hover:text-white"><Facebook /></Link>
                <Link href="#" className="text-white/80 hover:text-white"><Twitter /></Link>
                <Link href="#" className="text-white/80 hover:text-white"><Instagram /></Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/30 pt-8 text-center text-sm text-white/80">
          <p>&copy; {currentYear} FunB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
