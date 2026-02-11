'use client';

import Link from "next/link"
import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth, useFirestore } from "@/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
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
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if(userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName,
        });

        // Create user document immediately
        const userRef = doc(firestore, `users/${userCredential.user.uid}`);
        const data = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            name: fullName,
            photoURL: userCredential.user.photoURL,
            role: 'customer',
        };
        await setDoc(userRef, data);
      }
      // The global AuthHandler will now handle the redirection.
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    
    try {
       const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userRef = doc(firestore, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                photoURL: user.photoURL,
                role: 'customer',
            });
        }
        // The global AuthHandler will detect the new user state and redirect.
    } catch (error: any) {
       if (error.code !== 'auth/popup-closed-by-user') {
            console.error("Google Sign-Up Error:", error);
            toast({
                title: "Google Sign-Up Failed",
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
          <CardTitle className="text-xl font-headline">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="full-name">Full name</Label>
                <Input 
                  id="full-name" 
                  placeholder="John Doe" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting}
                />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
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
              {isSubmitting ? 'Creating account...' : 'Create an account'}
            </Button>
            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : 'Sign up with Google'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
