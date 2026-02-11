'use client';

import Link from "next/link";
import Image from "next/image";
import { Menu, LogOut, LayoutGrid } from "lucide-react";
import React, { Suspense } from 'react';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc } from 'firebase/firestore';

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
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
    role?: 'admin' | 'customer';
}

function UserNav() {
    const { user } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    const handleLogout = async () => {
        await signOut(auth);
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
        });
        router.push('/');
    };

    if (isProfileLoading || !user) {
        return <div className="h-9 w-9 rounded-full bg-muted animate-pulse"></div>;
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length > 1 && names[1]) {
            return names[0][0] + names[names.length - 1][0];
        }
        return name.substring(0, 2);
    }

    const isAdmin = userProfile?.role === 'admin';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`} data-ai-hint="user avatar" alt={user.displayName || 'User'} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isAdmin ? (
            <>
                <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard">
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                    </Link>
                </DropdownMenuItem>
            </>
          ) : (
            <>
                <DropdownMenuItem asChild>
                    <Link href="/account/profile">My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/account/my-courses">My Webinars</Link>
                </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

function HeaderContent() {
  const { user, isUserLoading } = useUser();

  const navLinks = [
    { href: "/courses", label: "Webinar" },
    { href: "#", label: "Bootcamps" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-accent/90 text-primary-foreground backdrop-blur supports-[backdrop-filter]:bg-accent/80">
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
                className="transition-colors hover:text-primary-foreground/80 text-primary-foreground/90"
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
              className="md:hidden hover:bg-white/10"
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
            {isUserLoading ? (
              <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse"></div>
            ) : user ? (
                <UserNav />
            ) : (
                <>
                    <Button variant="ghost" asChild className="hover:bg-white/10">
                        <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild className="bg-primary-foreground text-accent hover:bg-primary-foreground/90">
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </>
            )}
        </div>
      </div>
    </header>
  );
}

export default function SiteHeader() {
  return (
    <Suspense fallback={<div className="h-16 border-b"></div>}>
      <HeaderContent />
    </Suspense>
  )
}
