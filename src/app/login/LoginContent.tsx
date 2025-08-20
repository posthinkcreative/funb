'use client'

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useState } from 'react';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  // Pastikan ini hanya berjalan di client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    
    toast({
        title: "Login Successful",
        description: "Welcome back! You are now logged in.",
    });

    // Gunakan searchParams hanya jika sudah tersedia (client side)
    if (isClient) {
      const redirectUrl = searchParams?.get('redirect');

      if (redirectUrl) {
          const urlWithLoginState = redirectUrl.includes('?') 
              ? `${redirectUrl}&loggedIn=true`
              : `${redirectUrl}?loggedIn=true`;
          router.push(urlWithLoginState);
      } else {
          router.push("/account/profile?loggedIn=true");
      }
    } else {
      // Fallback jika searchParams belum tersedia
      router.push("/account/profile?loggedIn=true");
    }
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="demo@example.com"
                required
                defaultValue="demo@example.com"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}