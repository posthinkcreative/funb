
'use client';

import { usePathname } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import React from 'react';

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPage && <SiteHeader />}
      <main className="flex-grow">{children}</main>
      {!isAdminPage && <SiteFooter />}
    </div>
  );
}
