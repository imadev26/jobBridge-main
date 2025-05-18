"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, LayoutDashboard, User, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function MainNav() {
  const { isAuthenticated, role, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center px-4 sm:px-6 mx-auto max-w-7xl">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/" className="text-lg font-medium">
                Accueil
              </Link>
              <Link href="/search" className="text-lg font-medium">
                Recherche
              </Link>
              {isAuthenticated ? (
                <>
                  {role === "STUDENT" && (
                    <Link href="/saved" className="flex items-center gap-2 text-lg font-medium">
                      <Star className="h-4 w-4" />
                      Offres sauvegardées
                    </Link>
                  )}
                  {role === "STUDENT" && (
                     <Link href="/candidatures" className="flex items-center gap-2 text-lg font-medium">
                       <LayoutDashboard className="h-4 w-4" />
                      Mes candidatures
                    </Link>
                  )}
                  {role === "COMPANY" && (
                     <Link href="/company/dashboard" className="flex items-center gap-2 text-lg font-medium">
                       <LayoutDashboard className="h-4 w-4" />
                      Tableau de bord entreprise
                    </Link>
                  )}
                  {role === "COMPANY" && (
                     <Link href="/company/offers" className="flex items-center gap-2 text-lg font-medium">
                       <LayoutDashboard className="h-4 w-4" />
                      Gestion des offres
                    </Link>
                  )}
                   {role === "COMPANY" && (
                     <Link href="/company/interviews" className="flex items-center gap-2 text-lg font-medium">
                       Entretiens Planifiés
                    </Link>
                  )}
                  <button className="flex items-center gap-2 text-lg font-medium text-red-500" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-lg font-medium">
                    Connexion
                  </Link>
                  <Link href="/register" className="text-lg font-medium">
                    Inscription
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center justify-between w-full">
          <div className="flex-1 md:flex-none">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
                <span className="text-sm font-bold">JB</span>
              </div>
              <span className="text-xl font-bold text-blue-600">JobBridge</span>
            </Link>
          </div>
          <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center">
            <div className="flex gap-6 text-sm">
              {role !== "COMPANY" && (
              <Link href="/" className="font-medium transition-colors hover:text-blue-600">
                Accueil
              </Link>
              )}
              {role !== "COMPANY" && (
              <Link href="/search" className="font-medium transition-colors hover:text-blue-600">
                Recherche
              </Link>
              )}
              {isAuthenticated && (
                <>
                   {role === "STUDENT" && (
                     <Link href="/saved" className="font-medium transition-colors hover:text-blue-600">
                      Offres sauvegardées
                    </Link>
                  )}
                   {role === "STUDENT" && (
                     <Link href="/candidatures" className="font-medium transition-colors hover:text-blue-600">
                      Mes candidatures
                    </Link>
                  )}
                   {role === "COMPANY" && (
                     <Link href="/company/dashboard" className="font-medium transition-colors hover:text-blue-600">
                      Tableau de bord entreprise
                    </Link>
                  )}
                  {role === "COMPANY" && (
                     <Link href="/company/offers" className="font-medium transition-colors hover:text-blue-600">
                      Gestion des offres
                    </Link>
                  )}
                   {role === "COMPANY" && (
                     <Link href="/company/interviews" className="font-medium transition-colors hover:text-blue-600">
                       Entretiens Planifiés
                    </Link>
                  )}
                </>
              )}
            </div>
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {(role === "STUDENT" || role === "COMPANY") && (
                   <Link href="/profile">
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <AvatarImage
                        src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
                        alt="Avatar"
                        className="object-cover"
                      />
                      <AvatarFallback>IA</AvatarFallback>
                    </Avatar>
                  </Link>
                 )}
                <Button variant="ghost" onClick={handleLogout} className="hidden md:flex">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden md:block">
                  <Button variant="outline">Connexion</Button>
                </Link>
                <Link href="/register">
                  <Button>Inscription</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
