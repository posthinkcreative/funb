'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, BookMarked, Settings, LogOut, History } from "lucide-react"
import { useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import React from "react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const navItems = [
  {
    href: "/account/profile",
    label: "My Profile",
    icon: User,
  },
  {
    href: "/account/my-webinars",
    label: "My Webinars",
    icon: BookMarked,
  },
  {
    href: "/account/transactions",
    label: "Order History",
    icon: History,
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
  
  const handleLogout = async () => {
      await signOut(auth);
      toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
      });
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
       <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
    </nav>
  )
}
