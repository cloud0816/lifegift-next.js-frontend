"use client"

import { useState, useEffect } from "react"
import { UserProvider } from "@auth0/nextjs-auth0/client"
import { Moon, Sun, LogOut, User } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { useUser } from "@auth0/nextjs-auth0/client"
import { MockAuthProvider, useMockUser } from "@/app/providers/mock-auth-provider"
import { isAuth0Configured } from "@/lib/auth-config"
import { useRouter } from "next/navigation"
import { Sidebar, MobileSidebar } from "@/app/components/sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/app/components/ui/sheet"
import { Menu } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/app/components/logo"

export function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [darkMode, setDarkMode] = useState(true) // Default to dark mode

  useEffect(() => {
    setMounted(true)
    // Default to dark mode for enterprise dashboard
    const savedTheme = localStorage.getItem("theme")
    const shouldBeDark = savedTheme === "dark" || savedTheme === null
    
    setDarkMode(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  // Update theme-color meta tag and favicon when darkMode changes
  useEffect(() => {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    const themeColor = darkMode 
      ? "hsl(222.2 84% 4.9%)" // Dark mode background
      : "hsl(0 0% 100%)" // Light mode background
    
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", themeColor)
    } else {
      const meta = document.createElement("meta")
      meta.name = "theme-color"
      meta.content = themeColor
      document.head.appendChild(meta)
    }

    // Update favicon based on theme
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (favicon) {
      favicon.href = darkMode ? "/logo-white.svg" : "/logo-black.svg"
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
    
    // Update theme-color meta tag and favicon immediately
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    const themeColor = newDarkMode 
      ? "hsl(222.2 84% 4.9%)" // Dark mode background
      : "hsl(0 0% 100%)" // Light mode background
    
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", themeColor)
    }

    // Update favicon immediately
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (favicon) {
      favicon.href = newDarkMode ? "/logo-white.svg" : "/logo-black.svg"
    }
  }

  if (!mounted) {
    return null
  }

  // For UI development/demo mode, we'll use mock auth
  const useAuth0 = false

  const AuthWrapper = useAuth0 ? UserProvider : MockAuthProvider

  return (
    <AuthWrapper>
      <AuthAwareLayout useAuth0={useAuth0} darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        {children}
      </AuthAwareLayout>
    </AuthWrapper>
  )
}

function AuthAwareLayout({ 
  children, 
  useAuth0, 
  darkMode, 
  toggleDarkMode 
}: { 
  children: React.ReactNode
  useAuth0: boolean
  darkMode: boolean
  toggleDarkMode: () => void
}) {
  const auth0User = useAuth0 ? useUser() : { user: undefined, isLoading: false }
  const mockAuth = !useAuth0 ? useMockUser() : { user: undefined, isLoading: false }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const user = useAuth0 ? auth0User.user : mockAuth.user
  const isLoading = useAuth0 ? auth0User.isLoading : mockAuth.isLoading

  // Show full layout only when authenticated
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Show minimal layout for unauthenticated pages
    return (
      <div className="min-h-screen bg-background">
        <main>{children}</main>
      </div>
    )
  }

  // Show full layout with sidebar for authenticated users
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <MobileSidebar onNavigate={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            {!useAuth0 && (
              <Badge variant="outline" className="hidden md:inline-flex">
                Demo Mode
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <UserMenu useAuth0={useAuth0} />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

function UserMenu({ useAuth0 }: { useAuth0: boolean }) {
  const auth0User = useAuth0 ? useUser() : { user: undefined, isLoading: false }
  const mockAuth = !useAuth0 ? useMockUser() : { user: undefined, isLoading: false, logout: () => {}, login: () => {} }
  const router = useRouter()
  
  const user = useAuth0 ? auth0User.user : mockAuth.user
  const isLoading = useAuth0 ? auth0User.isLoading : mockAuth.isLoading

  const handleLogout = () => {
    if (!useAuth0 && mockAuth.logout) {
      mockAuth.logout()
      router.push("/pages/signin")
    }
  }

  if (isLoading) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
  }

  if (!user) {
    return (
      <Link href={useAuth0 ? "/api/auth/login" : "/pages/signin"}>
        <Button>Sign In</Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.picture} alt={user.name || "User"} />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/pages/dashboard" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {useAuth0 ? (
          <DropdownMenuItem asChild>
            <Link href="/api/auth/logout" className="flex items-center text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
