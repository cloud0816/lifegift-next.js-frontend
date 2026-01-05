"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from "react"
import { MOCK_USER } from "@/lib/auth-config"

interface MockUser {
  name?: string | null
  email?: string | null
  picture?: string | null
  sub?: string | null
}

interface MockAuthContextType {
  user: MockUser | undefined
  isLoading: boolean
  error: Error | undefined
  logout: () => void
  login: () => void
}

const MockAuthContext = createContext<MockAuthContextType>({
  user: undefined,
  isLoading: false,
  error: undefined,
  logout: () => {},
  login: () => {},
})

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for sign-in state
    const savedState = localStorage.getItem("mock-auth-signed-in")
    if (savedState !== null) {
      setIsSignedIn(savedState === "true")
    } else {
      // Default to signed in for demo mode
      setIsSignedIn(true)
      localStorage.setItem("mock-auth-signed-in", "true")
    }
    setIsLoading(false)
  }, [])

  const logout = () => {
    setIsSignedIn(false)
    localStorage.setItem("mock-auth-signed-in", "false")
  }

  const login = () => {
    setIsSignedIn(true)
    localStorage.setItem("mock-auth-signed-in", "true")
  }

  const user = isSignedIn ? MOCK_USER : undefined

  return (
    <MockAuthContext.Provider value={{ user, isLoading, error: undefined, logout, login }}>
      {children}
    </MockAuthContext.Provider>
  )
}

export function useMockUser() {
  return useContext(MockAuthContext)
}

