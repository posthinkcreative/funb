'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import useIdleTimeout from '@/hooks/use-idle-timeout';

// AuthHandler ensures route authorization logic is central and stable.
function AuthHandler({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectParam = searchParams.get('redirect');
    const { user, isUserLoading, auth } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [isRouteAuthorized, setIsRouteAuthorized] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<any>(userDocRef);

    const isDataLoading = !hasMounted || isUserLoading || (!!user && isProfileLoading);
    
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

    useEffect(() => {
        if (isDataLoading) return;

        const userRole = userProfile?.role || 'customer';
        const isAuthPage = pathname === '/login' || pathname === '/signup';
        const isAdminPage = pathname.startsWith('/admin');
        const isAccountPage = pathname.startsWith('/account');
        let redirectPath: string | null = null;

        if (!user) {
            if (isAdminPage || isAccountPage) {
                redirectPath = `/login?redirect=${encodeURIComponent(pathname)}`;
            }
        } else {
            if (isAuthPage) {
                redirectPath = redirectParam || (userRole === 'admin' ? '/admin/dashboard' : '/account');
            } else if (isAdminPage && userRole !== 'admin') {
                redirectPath = '/account';
            } else if (isAccountPage && userRole === 'admin') {
                redirectPath = '/admin/dashboard';
            }
        }
        
        if (redirectPath && redirectPath !== pathname) {
            router.replace(redirectPath);
            setIsRouteAuthorized(false);
        } else {
            setIsRouteAuthorized(true);
        }

    }, [isDataLoading, user, userProfile, pathname, redirectParam, router]);
    
    if (!hasMounted || !isRouteAuthorized) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                <p suppressHydrationWarning className="mt-4 text-sm text-muted-foreground">
                    Loading...
                </p>
            </div>
        );
    }
    
    return <>{children}</>;
}

function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');
    
    return (
        <AuthHandler>
            {!isAdminPage && <SiteHeader />}
            <main className="flex-grow">{children}</main>
            {!isAdminPage && <SiteFooter />}
        </AuthHandler>
    );
}

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
       <Suspense fallback={
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          <p suppressHydrationWarning className="mt-4 text-sm text-muted-foreground">
            Loading...
          </p>
        </div>
      }>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </Suspense>
    </div>
  );
}
