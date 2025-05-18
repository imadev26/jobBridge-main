"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, ArrowLeft, Eye, XCircle, CheckCircle } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { applicationService } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

type ApplicationStatus = "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED"

interface Application {
  id: string
  studentId: string
  offerId: string
  cv: string
  coverLetter: string
  status: ApplicationStatus
  dateSubmitted: string
  lastUpdated: string
  student?: {
    name: string
    email: string
  }
  offer?: {
    title: string
    company: {
      name: string
    }
  }
}

interface ApplicationCardProps {
  application: Application
  getStatusBadge: (status: ApplicationStatus) => React.ReactNode
  onView: () => void
  onStatusUpdate: (status: ApplicationStatus) => void
}

export default function AdminApplications() {
  const router = useRouter()
  const { isAuthenticated, role } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Ensure user is authenticated and is an ADMIN before fetching applications
    if (!isAuthenticated || role !== "ADMIN") {
      router.push("/login") // Redirect to login if not authenticated or not admin
      return
    }
    fetchApplications()
  }, [isAuthenticated, role, router]) // Add isAuthenticated and role to dependency array

  useEffect(() => {
    filterApplications()
  }, [searchQuery, applications])

  const fetchApplications = async () => {
    try {
      // In a real application, you would fetch from the API
      // For now, we'll use mock data
      const mockApplications: Application[] = [
        {
          id: "1",
          studentId: "1",
          offerId: "1",
          cv: "cv1.pdf",
          coverLetter: "Je suis très intéressé par ce stage...",
          status: "SUBMITTED",
          dateSubmitted: "2024-03-15",
          lastUpdated: "2024-03-15",
          student: {
            name: "John Doe",
            email: "john@example.com",
          },
          offer: {
            title: "Stage Développeur Frontend",
            company: {
              name: "Tech Corp",
            },
          },
        },
        // Add more mock applications as needed
      ]
      setApplications(mockApplications)
      setFilteredApplications(mockApplications)
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error("Erreur lors du chargement des candidatures")
    } finally {
      setIsLoading(false)
    }
  }

  const filterApplications = () => {
    const filtered = applications.filter((app) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        app.student?.name.toLowerCase().includes(searchLower) ||
        app.offer?.title.toLowerCase().includes(searchLower) ||
        app.offer?.company.name.toLowerCase().includes(searchLower)
      )
    })
    setFilteredApplications(filtered)
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, newStatus)
      toast.success("Statut mis à jour avec succès")
      fetchApplications() // Refresh the list
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Erreur lors de la mise à jour du statut")
    }
  }

  const getStatusBadge = (status: ApplicationStatus): React.ReactNode => {
    switch (status) {
      case "SUBMITTED":
        return <Badge variant="secondary">Soumis</Badge>
      case "UNDER_REVIEW":
        return <Badge variant="outline">En cours d'examen</Badge>
      case "ACCEPTED":
        return <Badge variant="default">Accepté</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Refusé</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6 md:py-8">
          <div className="mb-6 flex items-center gap-2">
            <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
            <h1 className="text-2xl font-bold">Gestion des candidatures</h1>
          </div>

          <div className="mb-6 w-full md:max-w-sm">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher par étudiant, email ou stage..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="mb-6 grid w-full grid-cols-4 rounded-lg">
                <TabsTrigger value="all">Toutes ({filteredApplications.length})</TabsTrigger>
                <TabsTrigger value="pending">En attente ({filteredApplications.filter(app => app.status === "SUBMITTED").length})</TabsTrigger>
                <TabsTrigger value="accepted">Acceptées ({filteredApplications.filter(app => app.status === "ACCEPTED").length})</TabsTrigger>
                <TabsTrigger value="rejected">Refusées ({filteredApplications.filter(app => app.status === "REJECTED").length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((application: Application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      getStatusBadge={getStatusBadge}
                      onView={() => {
                        setSelectedApplication(application)
                        setIsViewDialogOpen(true)
                      }}
                      onStatusUpdate={(newStatus: ApplicationStatus) => handleStatusUpdate(application.id, newStatus)}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-500">Aucune candidature trouvée.</p>
                )}
              </TabsContent>

              {/* Add TabsContent for other statuses (Pending, Accepted, Rejected) */}
              <TabsContent value="pending" className="space-y-4">
                 {filteredApplications.filter(app => app.status === "SUBMITTED").length > 0 ? (
                  filteredApplications.filter(app => app.status === "SUBMITTED").map((application: Application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      getStatusBadge={getStatusBadge}
                      onView={() => {
                        setSelectedApplication(application)
                        setIsViewDialogOpen(true)
                      }}
                      onStatusUpdate={(newStatus: ApplicationStatus) => handleStatusUpdate(application.id, newStatus)}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-500">Aucune candidature en attente.</p>
                )}
              </TabsContent>

              <TabsContent value="accepted" className="space-y-4">
                 {filteredApplications.filter(app => app.status === "ACCEPTED").length > 0 ? (
                  filteredApplications.filter(app => app.status === "ACCEPTED").map((application: Application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      getStatusBadge={getStatusBadge}
                      onView={() => {
                        setSelectedApplication(application)
                        setIsViewDialogOpen(true)
                      }}
                      onStatusUpdate={(newStatus: ApplicationStatus) => handleStatusUpdate(application.id, newStatus)}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-500">Aucune candidature acceptée.</p>
                )}
              </TabsContent>

               <TabsContent value="rejected" className="space-y-4">
                 {filteredApplications.filter(app => app.status === "REJECTED").length > 0 ? (
                  filteredApplications.filter(app => app.status === "REJECTED").map((application: Application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      getStatusBadge={getStatusBadge}
                      onView={() => {
                        setSelectedApplication(application)
                        setIsViewDialogOpen(true)
                      }}
                      onStatusUpdate={(newStatus: ApplicationStatus) => handleStatusUpdate(application.id, newStatus)}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-500">Aucune candidature refusée.</p>
                )}
              </TabsContent>

            </Tabs>
          )}

          {/* View Application Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Détails de la candidature</DialogTitle>
              </DialogHeader>
              {selectedApplication && (
                <div className="grid gap-4 py-4">
                  <div>
                    <h3 className="text-lg font-medium">Étudiant</h3>
                    <p>Nom: {selectedApplication.student?.name}</p>
                    <p>Email: {selectedApplication.student?.email}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Offre</h3>
                    <p>Titre: {selectedApplication.offer?.title}</p>
                    <p>Entreprise: {selectedApplication.offer?.company.name}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Statut</h3>
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">CV</h3>
                    <a href={selectedApplication.cv} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Voir CV</a>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Lettre de motivation</h3>
                    <p>{selectedApplication.coverLetter}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                     <Button variant="outline" onClick={() => handleStatusUpdate(selectedApplication.id, "ACCEPTED")} disabled={selectedApplication.status === "ACCEPTED"}>
                       <CheckCircle className="mr-2 h-4 w-4" /> Accepter
                     </Button>
                     <Button variant="destructive" onClick={() => handleStatusUpdate(selectedApplication.id, "REJECTED")} disabled={selectedApplication.status === "REJECTED"}>
                       <XCircle className="mr-2 h-4 w-4" /> Refuser
                     </Button>
                   </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

        </div>
      </main>
      <Footer />
    </div>
  )
}

function ApplicationCard({ application, getStatusBadge, onView, onStatusUpdate }: {
  application: Application;
  getStatusBadge: (status: ApplicationStatus) => React.ReactNode;
  onView: () => void;
  onStatusUpdate: (newStatus: ApplicationStatus) => void;
}) {
  return (
    <Card key={application.id}>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="font-medium">{application.student?.name}</p>
          <p className="text-sm text-gray-600">{application.offer?.title} chez {application.offer?.company.name}</p>
          <div className="mt-1">
            {getStatusBadge(application.status)}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="mr-2 h-4 w-4" /> Voir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 