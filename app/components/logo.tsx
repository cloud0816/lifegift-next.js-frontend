"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

interface LogoProps {
  className?: string
  width?: number
  height?: number
  variant?: "black" | "white" | "auto"
}

export function Logo({ className = "", width = 32, height = 32, variant = "auto" }: LogoProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains("dark")
      setIsDark(isDarkMode)
    }

    // Initial check
    checkDarkMode()

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  const logoSrc = variant === "auto" 
    ? (isDark ? "/logo-white.svg" : "/logo-black.svg")
    : variant === "white"
    ? "/logo-white.svg"
    : "/logo-black.svg"

  return (
    <Image
      src={logoSrc}
      alt="LifeGift Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}

