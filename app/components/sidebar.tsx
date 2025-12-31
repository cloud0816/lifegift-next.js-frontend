"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  TrendingDown, 
  Server, 
  Settings,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/app/components/logo"

export const navigation = [
  { name: "Overview", href: "/pages/dashboard", icon: LayoutDashboard },
  { name: "Waste Report", href: "/pages/waste-report", icon: TrendingDown },
  { name: "Clusters", href: "/pages/clusters", icon: Server },
  { name: "Analytics", href: "/pages/analytics", icon: BarChart3 },
  { name: "Settings", href: "/pages/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-32 items-center border-b border-border px-6 flex items-center justify-center">
        <Link href="/pages/dashboard" className="flex items-center gap-2">
          <Logo variant="auto" width={128} height={128} className="h-24 w-24" />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative",
                isActive
                  ? "dark:bg-gray-800 text-foreground border-l-4 border-blue-500"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function MobileSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-32 border-b border-border px-6 items-center justify-center">
        <Link 
          href="/pages/dashboard" 
          className="flex items-center gap-2"
          onClick={handleLinkClick}
        >
          <Logo variant="auto" width={64} height={64} className="h-24 w-24" />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative",
                isActive
                  ? "dark:bg-gray-800 text-foreground border-l-4 border-blue-500"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

