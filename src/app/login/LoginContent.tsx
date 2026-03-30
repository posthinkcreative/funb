'use client'

import Link from "next/link"
import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";
import { useAuth, useFirestore } from "@/firebase";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Eye, EyeOff, AlertCircle } from "lucide-react";


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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginContent() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
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

      if (!userSnap.exists()) {
          await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              name: user.displayName,
              photoURL: user.photoURL,
              role: 'customer',
          });
      }
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!forgotEmail) {
        setResetError("Please enter your email address.");
        return;
    }

    setIsResetting(true);
    try {
        await sendPasswordResetEmail(auth, forgotEmail);
        
        // Tutup dialog dulu baru tampilkan toast sukses
        setIsDialogOpen(false);
        toast({
            title: "Reset Link Sent",
            description: `We've sent a password reset link to ${forgotEmail}. Please check your inbox and spam folder.`,
        });
        setForgotEmail('');
    } catch (error: any) {
        // Kami menangani error secara visual di UI, jadi hapus console.error agar tidak memicu overlay pengembangan
        let message = "Failed to send reset email. Please try again later.";
        
        // Error ini hanya akan muncul jika 'Email Enumeration Protection' dimatikan di Console
        if (error.code === 'auth/user-not-found') {
            message = "This email is not registered in our system.";
        } else if (error.code === 'auth/invalid-email') {
            message = "Please enter a valid email address.";
        } else if (error.code === 'auth/too-many-requests') {
            message = "Too many requests. Please try again in a few minutes.";
        }

        setResetError(message);
    } finally {
        setIsResetting(false);
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
          {/* Form Login Utama */}
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
                <button
                    type="button"
                    onClick={() => {
                        setResetError(null);
                        setIsDialogOpen(true);
                    }}
                    className="ml-auto inline-block text-sm underline hover:text-primary transition-colors"
                >
                    Forgot your password?
                </button>
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

      {/* Dialog Lupa Kata Sandi (Berada di luar Card Login) */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setResetError(null);
      }}>
          <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleForgotPassword}>
                  <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                          Enter your email address and we'll send you a link to reset your password.
                      </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                      {resetError && (
                          <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Error</AlertTitle>
                              <AlertDescription>{resetError}</AlertDescription>
                          </Alert>
                      )}
                      <div className="grid gap-2">
                          <Label htmlFor="forgot-email">Email Address</Label>
                          <Input
                              id="forgot-email"
                              type="email"
                              placeholder="name@example.com"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              required
                              disabled={isResetting}
                          />
                      </div>
                  </div>
                  <DialogFooter>
                      <Button type="submit" className="w-full" disabled={isResetting}>
                          {isResetting ? "Sending..." : "Send Reset Link"}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  )
}
