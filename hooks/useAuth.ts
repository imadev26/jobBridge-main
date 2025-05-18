import { useState, useEffect } from "react"
import { authService } from "@/lib/api"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = await authService.isAuthenticated()
        const isUserAdmin = await authService.isAdmin()
        setIsAuthenticated(isLoggedIn)
        setIsAdmin(isUserAdmin)
      } catch (error) {
        console.error("Error checking auth status:", error)
        setIsAuthenticated(false)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
  }
} 