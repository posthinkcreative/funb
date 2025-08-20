
'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, BookMarked, Settings, LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    href: "/account/profile",
    label: "My Profile",
    icon: User,
  },
  {
    href: "/account/my-courses",
    label: "My Courses",
    icon: BookMarked,
  },
  {
    href: "/account/settings",
    label: "Settings",
    icon: Settings,
  },
]

export function AccountNav() {
  const pathname = usePathname()

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
       <Link href="/">
         <Button variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
      </Link>
    </nav>
  )
}
