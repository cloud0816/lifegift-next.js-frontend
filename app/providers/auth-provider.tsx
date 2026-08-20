"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from "react"
import { authApi, User } from "@/lib/api-client"

interface AuthContextType {
  user: User | undefined
  isLoading: boolean
  error: Error | undefined
  logout: () => Promise<void>
  login: (provider: 'google' | 'github') => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  isLoading: true,
  error: undefined,
  logout: async () => {},
  login: () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  const fetchUser = async () => {
    try {
      setIsLoading(true)
      setError(undefined)
      const userData = await authApi.getCurrentUser()
      setUser(userData)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user')
      setError(error)
      setUser(undefined)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = (provider: 'google' | 'github') => {
    // Redirect to login route which will redirect to backend OAuth
    if (typeof window !== 'undefined') {
      window.location.href = `/api/auth/login/${provider}`;
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
      setUser(undefined)
    } catch (err) {
      console.error('Logout error:', err)
      // Clear user even if API call fails
      setUser(undefined)
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, logout, login, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

