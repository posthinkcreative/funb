'use client'

import Link from "next/link"
import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth, useFirestore } from "@/firebase";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Eye, EyeOff } from "lucide-react";


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
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The global AuthHandler in root-client-layout.tsx will now handle the redirection.
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  }

  const handleGoogleSignIn = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // If the user is new (e.g., first sign-in with Google), create their document.
      if (!userSnap.exists()) {
          await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              name: user.displayName,
              photoURL: user.photoURL,
              role: 'customer', // Default role
          });
      }
      // The global AuthHandler will detect the new user state and redirect.
    } catch (error: any) {
        if (error.code !== 'auth/popup-closed-by-user') {
            console.error("Google Sign-In Error:", error);
            toast({
                title: "Google Sign-In Failed",
                description: error.message,
                variant: "destructive",
            });
        }
        setIsSubmitting(false);
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
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
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : 'Login with Google'}
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
