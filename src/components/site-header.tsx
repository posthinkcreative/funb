
'use client';

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from 'react';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function UserNav() {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt="@shadcn" />
              <AvatarFallback>DU</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Demo User</p>
              <p className="text-xs leading-none text-muted-foreground">
                demo@example.com
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/account/profile">My Account</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/my-courses">My Courses</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
             <Link href="/">Logout</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

// This component uses useSearchParams, so it must be a client component.
// We extract it to keep the main header component as a Server Component if possible,
// and to wrap this part in a Suspense boundary.
function HeaderContent() {
  const searchParams = useSearchParams();
  const isLoggedIn = searchParams.get('loggedIn') === 'true';

  const navLinks = [
    { href: "/courses", label: "Courses" },
    { href: "#", label: "Bootcamps" },
    { href: "/admin/dashboard", label: "Admin" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/logo.png" alt="FunB Logo" width={32} height={32} />
            <span className="hidden font-bold font-headline sm:inline-block">
              FunB
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Link
              href="/"
              className="mr-6 flex items-center space-x-2"
            >
              <Image src="/logo.png" alt="FunB Logo" width={32} height={32} />
              <span className="font-bold font-headline">FunB</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
            {isLoggedIn ? (
                <UserNav />
            ) : (
                <>
                    <Button variant="ghost" asChild>
                        <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </>
            )}
        </div>
      </div>
    </header>
  );
}

// The main export is a clean component that wraps the client-side logic
// in a Suspense boundary. This prevents the entire app from being client-rendered
// just because the header needs to read search params.
export default function SiteHeader() {
  return (
    <Suspense fallback={<div>Loading header...</div>}>
      <HeaderContent />
    </Suspense>
  )
}
