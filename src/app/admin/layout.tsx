
'use client';

import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { LayoutGrid, BookCopy, Users, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import AdminFooter from './_components/admin-footer';
import { cn } from '@/lib/utils';

// Helper component to close sidebar after navigation on mobile devices
const SidebarClosingLink = ({ href, children, className }: { href: string; children: React.ReactNode, className?: string }) => {
  const { setOpenMobile } = useSidebar();

  const handleClick = () => {
    // Close sidebar on mobile view only
    setOpenMobile(false);
  };

  return (
    <Link href={href} onClick={handleClick} className={cn("flex items-center gap-2", className)}>
      {children}
    </Link>
  );
};


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/20">
                        <LayoutGrid className="text-primary w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-headline font-semibold">Admin Panel</h2>
                </div>
            </SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <SidebarClosingLink href="/admin/dashboard"><LayoutGrid /><span>Dashboard</span></SidebarClosingLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Courses">
                    <SidebarClosingLink href="/admin/courses"><BookCopy /><span>Courses</span></SidebarClosingLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Students">
                    <SidebarClosingLink href="#"><Users /><span>Students</span></SidebarClosingLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                    <SidebarClosingLink href="#"><Settings /><span>Settings</span></SidebarClosingLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Logout">
                        <SidebarClosingLink href="/"><LogOut /><span>Logout</span></SidebarClosingLink>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col bg-secondary/50">
            <header className="bg-background p-4 border-b flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold font-headline">Dashboard</h1>
            </header>
            <main className="flex-1 overflow-x-auto">
                {children}
            </main>
            <AdminFooter />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
