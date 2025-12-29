import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { RootLayout } from "./layout/root-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LifeGift",
  description: "LifeGift Application",
  icons: {
    icon: "/icon.svg",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(222.2 47.4% 11.2%)" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(222.2 84% 4.9%)" },
  ],
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  )
}

