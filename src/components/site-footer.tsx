
"use client";

import { Facebook, Twitter, Instagram } from "lucide-react"
import Link from "next/link"
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function SiteFooter() {
  const [isMounted, setIsMounted] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setIsMounted(true);
  }, []);


  if (!isMounted) {
    // Render a skeleton or null on the server to avoid hydration mismatch
    return null;
  }


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
            <p className="text-white/80 text-sm max-w-xs">
              Unlock your potential with our AI-powered learning platform.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            <div className="col-span-1">
              <h3 className="font-headline font-semibold mb-4 text-white">Courses</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-white/80 hover:text-white">Development</Link></li>
                <li><Link href="#" className="text-white/80 hover:text-white">Design</Link></li>
                <li><Link href="#" className="text-white/80 hover:text-white">Business</Link></li>
                <li><Link href="#" className="text-white/80 hover:text-white">Marketing</Link></li>
              </ul>
            </div>
            <div className="col-span-1">
              <h3 className="font-headline font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-white/80 hover:text-white">About Us</Link></li>
                <li><Link href="#" className="text-white/80 hover:text-white">Careers</Link></li>
                <li><Link href="#" className="text-white/80 hover:text-white">Press</Link></li>
                <li><Link href="#" className="text-white/80 hover:text-white">Contact</Link></li>
              </ul>
            </div>
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
