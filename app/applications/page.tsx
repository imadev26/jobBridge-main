"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const authStatus = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(authStatus)

    if (!authStatus) {
      router.push("/login")
      return
    }

    // Load applications from localStorage
    const savedApplications = JSON.parse(localStorage.getItem("applications") || "[]")
    setApplications(savedApplications)
  }, [router])

  // Filter applications by status
  const pendingApplications = applications.filter((app) => app.status === "En attente")
  const acceptedApplications = applications.filter((app) => app.status === "Acceptée")
  const rejectedApplications = applications.filter((app) => app.status === "Refusée")

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6 md:py-8 mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-2">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
            <h1 className="text-2xl font-bold">Mes candidatures</h1>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-6 grid w-full grid-cols-4 rounded-lg">
              <TabsTrigger value="all">Toutes ({applications.length})</TabsTrigger>
              <TabsTrigger value="pending">En attente ({pendingApplications.length})</TabsTrigger>
              <TabsTrigger value="accepted">Acceptées ({acceptedApplications.length})</TabsTrigger>
              <TabsTrigger value="rejected">Refusées ({rejectedApplications.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {applications.length > 0 ? (
                applications.map((application, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-blue-600 text-white">
                          {application.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="grid gap-1">
                          <h3 className="text-lg font-semibold">
                            <Link href={`/job/${application.jobId}`} className="hover:text-blue-600">
                              {application.jobTitle}
                            </Link>
                          </h3>
                          <p className="text-gray-500">{application.company}</p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span>{application.location}</span>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Candidature du {formatDate(application.appliedDate)}
                          </p>
                          <div className="mt-2">
                            <Badge
                              variant="outline"
                              className={
                                application.status === "En attente"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : application.status === "Acceptée"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                              }
                            >
                              {application.status}
                            </Badge>
                          </div>
                          {application.status === "Acceptée" && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Entretien prévu: 20/06/2023</p>
                              <p className="text-sm text-gray-500">
                                Retour: Profil correspondant parfaitement à nos besoins.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-gray-500">Vous n&apos;avez pas encore postulé à des offres.</p>
                  <Link href="/search" className="mt-4 text-blue-600 hover:underline">
                    Parcourir les offres disponibles
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-6">
              {pendingApplications.length > 0 ? (
                pendingApplications.map((application, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-blue-600 text-white">
                          {application.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="grid gap-1">
                          <h3 className="text-lg font-semibold">
                            <Link href={`/job/${application.jobId}`} className="hover:text-blue-600">
                              {application.jobTitle}
                            </Link>
                          </h3>
                          <p className="text-gray-500">{application.company}</p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span>{application.location}</span>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Candidature du {formatDate(application.appliedDate)}
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                              En attente
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-gray-500">Aucune candidature en attente pour le moment.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="accepted" className="space-y-6">
              {acceptedApplications.length > 0 ? (
                acceptedApplications.map((application, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-blue-600 text-white">
                          {application.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="grid gap-1">
                          <h3 className="text-lg font-semibold">
                            <Link href={`/job/${application.jobId}`} className="hover:text-blue-600">
                              {application.jobTitle}
                            </Link>
                          </h3>
                          <p className="text-gray-500">{application.company}</p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span>{application.location}</span>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Candidature du {formatDate(application.appliedDate)}
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-green-100 text-green-700">
                              Acceptée
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm font-medium">Entretien prévu: 20/06/2023</p>
                            <p className="text-sm text-gray-500">
                              Retour: Profil correspondant parfaitement à nos besoins.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-gray-500">Aucune candidature acceptée pour le moment.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-6">
              {rejectedApplications.length > 0 ? (
                rejectedApplications.map((application, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-blue-600 text-white">
                          {application.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="grid gap-1">
                          <h3 className="text-lg font-semibold">
                            <Link href={`/job/${application.jobId}`} className="hover:text-blue-600">
                              {application.jobTitle}
                            </Link>
                          </h3>
                          <p className="text-gray-500">{application.company}</p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span>{application.location}</span>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Candidature du {formatDate(application.appliedDate)}
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-red-100 text-red-700">
                              Refusée
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-gray-500">Aucune candidature refusée pour le moment.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
