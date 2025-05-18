"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, role } = useAuth()

  useEffect(() => {
    // Check if user is logged in and is admin
    if (!isAuthenticated || role !== "ADMIN") {
      router.push("/login")
    }
  }, [isAuthenticated, role, router])

  if (!isAuthenticated || role !== "ADMIN") {
    return null // Or a loading spinner/message
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
} 