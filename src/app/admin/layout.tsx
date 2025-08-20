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
} from '@/components/ui/sidebar';
import { LayoutGrid, BookCopy, Users, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import AdminFooter from './_components/admin-footer';

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
                  <Link href="/admin/dashboard"><LayoutGrid /><span>Dashboard</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Courses">
                    <Link href="/admin/courses"><BookCopy /><span>Courses</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Students">
                    <Link href="#"><Users /><span>Students</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                    <Link href="#"><Settings /><span>Settings</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Logout">
                        <Link href="/"><LogOut /><span>Logout</span></Link>
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
            <main className="flex-1 max-w-none">
                {children}
            </main>
            <AdminFooter />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
