
"use client";

import { Facebook, Twitter, Instagram } from "lucide-react"
import Link from "next/link"
import Image from "next/image";
import { useState, useEffect } from "react";

export default function SiteFooter() {
  const [isMounted, setIsMounted] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <footer className="bg-secondary/50 border-t">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
                <Image src="/logo.png" alt="FunB Logo" width={32} height={32} />
                <span className="text-xl font-bold font-headline">FunB</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Unlock your potential with our AI-powered learning platform.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            <div className="col-span-1">
              <h3 className="font-headline font-semibold mb-4">Courses</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Development</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Design</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Business</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Marketing</Link></li>
              </ul>
            </div>
            <div className="col-span-1">
              <h3 className="font-headline font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Press</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            <div className="col-span-1">
              <h3 className="font-headline font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram /></Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} FunB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
