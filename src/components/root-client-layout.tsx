'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import React, { useEffect, useState, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import useIdleTimeout from '@/hooks/use-idle-timeout';

// This component is the key to solving hydration errors, permission errors, and hook order issues.
// It acts as a gate, preventing children from rendering until all auth checks are complete and no redirection is needed.
function AuthHandler({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isUserLoading, auth } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    // This state is the single source of truth for rendering the children.
    const [isRouteAuthorized, setIsRouteAuthorized] = useState(false);
    
    // Wait for client-side mount to prevent hydration errors.
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Listen to the user's profile in real-time to react to role changes.
    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<any>(userDocRef);

    // Centralized loading state.
    const isDataLoading = !hasMounted || isUserLoading || (user && isProfileLoading);
    
    // Handle idle timeout
    const handleIdle = useCallback(() => {
        if (user && auth) {
            signOut(auth).then(() => {
                toast({
                    title: "Session Expired",
                    description: "You have been logged out due to inactivity.",
                });
            });
        }
    }, [user, auth, toast]);
    useIdleTimeout(900000, handleIdle);

    // This single effect now controls all authorization and redirection logic.
    useEffect(() => {
        // 1. Wait until all data is loaded before making any decisions.
        if (isDataLoading) {
            setIsRouteAuthorized(false); // Keep the gate closed while loading.
            return;
        }

        // 2. Once data is loaded, determine the redirect path.
        const userRole = userProfile?.role || 'customer';
        const isAuthPage = pathname === '/login' || pathname === '/signup';
        const isAdminPage = pathname.startsWith('/admin');
        const isAccountPage = pathname.startsWith('/account');
        let redirectPath: string | null = null;

        if (!user) {
            if (isAdminPage || isAccountPage) {
                redirectPath = `/login?redirect=${pathname}`;
            }
        } else {
            const successfulLoginRedirect = searchParams.get('redirect');
            if (isAuthPage) {
                redirectPath = successfulLoginRedirect || (userRole === 'admin' ? '/admin/dashboard' : '/account');
            } else if (isAdminPage && userRole !== 'admin') {
                redirectPath = '/account';
            } else if (isAccountPage && userRole === 'admin') {
                redirectPath = '/admin/dashboard';
            }
        }
        
        // 3. Perform action based on redirect path.
        if (redirectPath) {
            router.replace(redirectPath);
            setIsRouteAuthorized(false); // Keep gate closed during redirection.
        } else {
            // No redirect is needed, the route is authorized. Open the gate.
            setIsRouteAuthorized(true);
        }

    }, [isDataLoading, user, userProfile, pathname, searchParams, router]);
    
    // The render logic is now extremely simple.
    if (isRouteAuthorized) {
        return <>{children}</>;
    }
    
    // If the route is not yet authorized (or is redirecting), show a consistent loading screen.
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            <p 
              suppressHydrationWarning={true} 
              className="mt-4 text-sm text-muted-foreground"
            >
              Loading...
            </p>
        </div>
    );
}


export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <AuthHandler>
        {!isAdminPage && <SiteHeader />}
        <main className="flex-grow">{children}</main>
        {!isAdminPage && <SiteFooter />}
      </AuthHandler>
    </div>
  );
}
