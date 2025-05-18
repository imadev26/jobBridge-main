"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { MainNav } from "@/components/main-nav"

export default function StudentDashboard() {
  const { isAuthenticated, role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || role !== "STUDENT") {
      router.push("/login")
    }
  }, [isAuthenticated, role, router])

  if (!isAuthenticated || role !== "STUDENT") {
    return null // Or a loading spinner/message
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Tableau de bord étudiant</h1>
        <p>Bienvenue sur votre tableau de bord étudiant. Utilisez la barre de navigation pour rechercher des offres.</p>
      </main>
    </div>
  )
} 