'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, BookMarked, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import React from "react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

const navItems = [
  {
    href: "/account/profile",
    label: "My Profile",
    icon: User,
  },
  {
    href: "/account/my-courses",
    label: "My Webinars",
    icon: BookMarked,
  },
  {
    href: "/account/settings",
    label: "Settings",
    icon: Settings,
  },
]

export function AccountNav() {
  const pathname = usePathname();
  const auth = useAuth();
  const { toast } = useToast();
  
  // No longer need useUser or role checks here,
  // as the global guard ensures only authenticated customers see this.

  const handleLogout = async () => {
      await signOut(auth);
      toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
      });
      // The global auth handler will redirect to /login
  };


  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => (
        <Link key={index} href={item.href}>
          <Button
            variant={pathname === item.href ? "default" : "ghost"}
            className="w-full justify-start"
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        </Link>
      ))}
       <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
    </nav>
  )
}
