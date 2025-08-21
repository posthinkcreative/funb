"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from './ui/skeleton';

export default function HeroForm() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
        <div className="w-full max-w-sm space-y-2">
            <div className="flex space-x-2">
                <Skeleton className="h-10 max-w-lg flex-1" />
                <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
        </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-2">
      <form className="flex space-x-2">
        <Input
          type="email"
          placeholder="Enter your email"
          className="max-w-lg flex-1"
        />
        <Button type="submit" variant="default">
          Get Started
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">
        Sign up to get started. By signing up, you agree to our{' '}
        <Link href="#" className="underline underline-offset-2">
          Terms & Conditions
        </Link>
        .
      </p>
    </div>
  );
}
