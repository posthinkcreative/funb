import LayoutLoader from './layout-loader';
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The server component now directly renders the client component loader,
  // which will handle all client-side logic and authentication checks.
  return <LayoutLoader>{children}</LayoutLoader>;
}
