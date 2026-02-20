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
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LayoutGrid, BookCopy, Users, Settings, LogOut, ChevronDown, Eye, Star, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import AdminFooter from './_components/admin-footer';
import { cn } from '@/lib/utils';
import { useAuth } from "@/firebase";
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

// Helper component to close sidebar after navigation on mobile devices
const SidebarClosingLink = ({ href, children, className, onClick }: { href: string; children: React.ReactNode, className?: string, onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void }) => {
  const { setOpenMobile } = useSidebar();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Close sidebar on mobile view only
    setOpenMobile(false);
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={cn("flex items-center gap-2", className)}>
      {children}
    </Link>
  );
};

export default function LayoutLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // The Auth Guard in RootClientLayout now handles the protection.
  // This component can now focus solely on rendering the layout.
  
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
                  <SidebarMenuButton asChild tooltip="Webinar">
                      <SidebarClosingLink href="/admin/webinars"><BookCopy /><span>Webinar</span></SidebarClosingLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Users">
                      <SidebarClosingLink href="/admin/users"><Users /><span>Users</span></SidebarClosingLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Practitioner List">
                    <SidebarClosingLink href="/admin/practitioners"><Users /><span>Practitioner List</span></SidebarClosingLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Testimonials">
                    <SidebarClosingLink href="/admin/testimonials"><Star /><span>Edit Testimonial</span></SidebarClosingLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Collapsible>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between" tooltip="Website">
                          <div className='flex items-center gap-2'>
                            <Settings />
                            <span>Website</span>
                          </div>
                          <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="py-2 pl-8 pr-2 space-y-1">
                          <SidebarMenuButton asChild variant="ghost" className="w-full justify-start">
                            <SidebarClosingLink href="/admin/settings">Hero Carousel</SidebarClosingLink>
                          </SidebarMenuButton>
                           <SidebarMenuButton asChild variant="ghost" className="w-full justify-start">
                            <SidebarClosingLink href="/admin/settings/intro">Intro Section</SidebarClosingLink>
                          </SidebarMenuButton>
                          <SidebarMenuButton asChild variant="ghost" className="w-full justify-start">
                            <SidebarClosingLink href="/admin/settings/titles">Section Titles</SidebarClosingLink>
                          </SidebarMenuButton>
                          <SidebarMenuButton asChild variant="ghost" className="w-full justify-start">
                            <SidebarClosingLink href="/admin/settings/logos">Sponsor Logos</SidebarClosingLink>
                          </SidebarMenuButton>
                          <SidebarMenuButton asChild variant="ghost" className="w-full justify-start">
                            <SidebarClosingLink href="/admin/settings/video">Bootcamp Video</SidebarClosingLink>
                          </SidebarMenuButton>
                        </div>
                      </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="View Website">
                      <SidebarClosingLink href="/">
                        <Eye />
                        <span>View Website</span>
                      </SidebarClosingLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                      <SidebarMenuButton 
                          onClick={async () => {
                            try {
                              await signOut(auth);
                              toast({
                                title: "Logged Out",
                                description: "You have been successfully logged out.",
                              });
                              // Global guard will handle redirect to /login
                            } catch (error) {
                              console.error(error);
                            }
                          }} 
                          tooltip="Logout"
                          className="cursor-pointer"
                        >
                          <LogOut />
                          <span>Logout</span>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="flex-1 flex flex-col bg-secondary/50">
              <main className="flex-1 overflow-x-auto">
                  {children}
              </main>
              <AdminFooter />
          </SidebarInset>
        </div>
      </SidebarProvider>
  );
}
