"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit2 } from "lucide-react"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import { EditProfileForm } from "@/components/edit-profile-form"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { userService } from "@/lib/api"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { isAuthenticated, userId, role } = useAuth()

  useEffect(() => {
    // Check if user is logged in
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // In a real application, you would fetch user data from your backend
    // using the userId from the auth context.
    // For now, we'll simulate fetching data or use placeholder.
    const fetchUserData = async () => {
      if (!userId || !role) {
        setError("User ID or role is missing.")
        return
      }

      try {
        let response
        if (role === "STUDENT") {
          response = await userService.getStudentProfile(userId)
        } else if (role === "COMPANY") {
          response = await userService.getCompanyProfile(userId)
        }

        if (response && response.data) {
          setUserData(response.data)
        } else {
          setError("Failed to fetch profile data.")
        }
      } catch (err: any) {
        console.error("Error fetching profile data:", err)
        setError(err.response?.data?.message || "An error occurred while fetching profile data.")
      }
    }

    if (isAuthenticated) {
      fetchUserData()
    }
  }, [isAuthenticated, userId, role, router])

  if (!isAuthenticated || !userData) {
    return null // or a loading spinner
  }

  if (isEditing) {
    return <EditProfileForm onCancel={() => setIsEditing(false)} />
  }

  // Get first letters of name for avatar fallback
  const getInitials = () => {
    if (!userData.fullName) return "IA"
    return userData.fullName
      .split(" ")
      .map((part: string) => part.charAt(0))
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 bg-gray-50 py-6">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Mon Profil {role === "COMPANY" && "de l'entreprise"}</h1>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" /> Modifier
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                 <Avatar className="h-16 w-16">
                    <AvatarImage
                      src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
                      alt="Avatar"
                      className="object-cover"
                    />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                <div>
                  {role === "STUDENT" && (
                  <p className="text-lg font-medium text-gray-900">{userData.fullName}</p>
                  )}
                  {role === "COMPANY" && (
                     <p className="text-lg font-medium text-gray-900">{userData.name}</p>
                  )}
                  <p className="text-sm text-gray-500">{userData.email}</p>
                  <p className="text-sm text-gray-500">Rôle: {userData.role}</p>
                </div>
              </div>

              <Tabs defaultValue="overview" className="mt-8">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Aperçu</TabsTrigger>
                  <TabsTrigger value="activity">Activité</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-6 pt-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Informations générales</h3>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {role === "STUDENT" && (
                        <>
                          {/* Student specific fields */}
                       <div>
                        <p className="text-sm font-medium text-gray-500">Adresse</p>
                        <p className="mt-1 text-sm text-gray-900">{userData.address || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Téléphone</p>
                        <p className="mt-1 text-sm text-gray-900">{userData.contact || 'Non spécifié'}</p>
                      </div>
                       {/* Example of a progress bar for profile completion */}
                       <div className="sm:col-span-2">
                         <p className="text-sm font-medium text-gray-500 mb-2">Achèvement du profil</p>
                         {/* Simulate progress based on available data */}
                         <Progress value={userData.address && userData.contact ? 100 : 50} className="w-full" />
                       </div>
                        </>
                      )}
                      {role === "COMPANY" && (
                        <>
                          {/* Company specific fields */}
                           <div>
                            <p className="text-sm font-medium text-gray-500">Description</p>
                            <p className="mt-1 text-sm text-gray-900">{userData.description || 'Non spécifié'}</p>
                          </div>
                           <div>
                            <p className="text-sm font-medium text-gray-500">Site Web</p>
                            <p className="mt-1 text-sm text-gray-900">{userData.website || 'Non spécifié'}</p>
                          </div>
                           <div>
                            <p className="text-sm font-medium text-gray-500">Localisation</p>
                            <p className="mt-1 text-sm text-gray-900">{userData.location || 'Non spécifié'}</p>
                          </div>
                           <div>
                            <p className="text-sm font-medium text-gray-500">Email de contact</p>
                            <p className="mt-1 text-sm text-gray-900">{userData.contactEmail || 'Non spécifié'}</p>
                          </div>
                           <div>
                            <p className="text-sm font-medium text-gray-500">Téléphone de contact</p>
                            <p className="mt-1 text-sm text-gray-900">{userData.contactPhone || 'Non spécifié'}</p>
                          </div>
                           {/* Add company logo if applicable */}
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="activity" className="space-y-6 pt-4">
                   <div>
                    <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
                    {/* Add recent activity like applied jobs or saved offers here */}
                    <p className="mt-4 text-sm text-gray-500">Aucune activité récente.</p>
                   </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
