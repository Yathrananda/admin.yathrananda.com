"use client"

import { Home, Package, HelpCircle, MessageSquare, LogOut, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { SidebarHeader } from "./ui/sidebar"


const items = [
  {
    title: "Hero Section",
    url: "/",
    icon: Home,
  },
  {
    title: "Travel Packages",
    url: "/packages",
    icon: Package,
  },
  {
    title: "FAQs",
    url: "/faqs",
    icon: HelpCircle,
  },
  {
    title: "Testimonials",
    url: "/testimonials",
    icon: MessageSquare,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { toast } = useToast()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Logout failed")
      }

      // Force a hard navigation to the login page
      window.location.href = "/login"
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout. Please try again.",
      })
    }
  }

  const SidebarContent = () => (
    <>
      <SidebarHeader className="border-b px-6 pt-4 pb-3">
        <h1 className="text-2xl font-bold">Yathrananda</h1>
        <p className="text-sm text-muted-foreground">Admin Dashboard</p>
      </SidebarHeader>
      <div className="flex-1 overflow-auto">
        <nav className="space-y-1 p-4">
          {items.map((item) => (
            <Link 
              key={item.title}
              href={item.url}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === item.url 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-base text-muted-foreground hover:text-primary"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed right-6 top-4 z-40 md:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-8 w-8" />
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTitle className="sr-only">Yathrananda</SheetTitle>
        <SheetContent side="left" className="w-[300px] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden h-screen w-[300px] flex-col border-r bg-background md:flex">
        <SidebarContent />
      </div>
    </>
  )
}
