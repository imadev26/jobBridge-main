"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import { applicationService, userService } from "@/lib/api"; // Note: lib/api.ts might have linter errors
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Application {
  id: string;
  studentId: string;
  offerId: string;
  status: string; // e.g., SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED
  dateSubmitted: string;
  // Assuming the API returns nested student info for display
  student?: { 
    name: string;
    email: string;
  };
  // Assuming the API might return offer title here or we fetch it separately if needed
  offer?: {
    title: string;
  };
}

export default function CompanyApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const offerId = Array.isArray(params.offerId) ? params.offerId[0] : params.offerId;

  const { isAuthenticated, role, isLoading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL"); // State for status filter
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Wait for client-side rendering and auth state to finish loading
    if (!isClient || authLoading) {
      return;
    }

    // Auth loading is complete. Check if authenticated and is a COMPANY.
    if (!isAuthenticated || role !== "COMPANY") {
      console.log('Redirecting non-company or unauthenticated user to login');
      router.push("/login");
      return;
    }

    // User is authenticated and is a COMPANY. Fetch applications for the offer.
    const fetchApplications = async () => {
      if (!offerId) {
         setError("Offer ID is missing.");
         setLoading(false);
         return;
      }
      try {
        setLoading(true);
        // Note: lib/api.ts might have linter errors that could affect this call.
        const response = await applicationService.getOfferApplications(offerId);
        console.log('Applications for offer fetched:', response.data);

        // Assuming the API returns an array of application objects directly
        // Fetch student details for each application
        const applicationsWithStudentDetails = await Promise.all(response.data.map(async (application: Application) => {
            try {
                // Assuming a service like applicationService or studentService has a method to get student by ID
                // This might need adjustment based on the actual API service structure
                const studentResponse = await userService.getStudentProfile(application.studentId);
                return {
                    // Keep existing application data
                    ...application,
                    // Add fetched student data
                    student: studentResponse.data // Assuming student details are in response.data
                };
            } catch (studentError) {
                console.error(`Error fetching student details for ID ${application.studentId}:`, studentError);
                // If student details cannot be fetched, return application with empty student object or handle as needed
                return {
                    ...application,
                    student: undefined // Or { name: 'N/A', email: 'N/A' } depending on desired fallback
                };
            }
        }));


        setApplications(applicationsWithStudentDetails);
      } catch (err: any) {
        console.error("Error fetching applications for offer:", err);
        setError("Une erreur est survenue lors du chargement des candidatures.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();

  }, [isClient, authLoading, isAuthenticated, role, router, offerId]);

  useEffect(() => {
    // Filter applications whenever the applications list or filterStatus changes
    if (filterStatus === "ALL") {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === filterStatus));
    }
  }, [applications, filterStatus]);

  const getStatusBadge = (status: string) => {
      // Map backend statuses to frontend display/badges
      switch (status) {
        case "SUBMITTED":
          return <Badge variant="secondary">Soumis</Badge>;
        case "UNDER_REVIEW":
          return <Badge variant="outline">En cours d'examen</Badge>;
        case "INTERVIEW_SCHEDULED":
          return <Badge variant="outline" className="bg-orange-100 text-orange-700">Entretien prévu</Badge>;
        case "ACCEPTED":
          return <Badge variant="default" className="bg-green-100 text-green-700">Accepté</Badge>;
        case "REJECTED":
          return <Badge variant="destructive">Refusé</Badge>;
        case "WITHDRAWN": // Assuming WITHDRAWN is also a possible status
          return <Badge variant="secondary">Retiré</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
  };

  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
      // TODO: Implement update status API call and update state
      console.log(`Update application ${applicationId} status to ${newStatus}`);
  };

  if (authLoading || !isClient) {
     return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container mx-auto py-6 text-center">Chargement de l'authentification...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container mx-auto py-6 text-center">Chargement des candidatures...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container mx-auto py-6 text-center text-red-500">Erreur: {error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  // Render applications list
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav /> {/* Assuming MainNav is suitable for both student and company, or needs adaptation */}
      <main className="flex-1 bg-gray-100 p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
           <div className="flex justify-between items-center mb-6">
              {/* You might want to fetch the offer title to display here */}
             <h1 className="text-3xl font-bold">Candidatures pour l'offre {offerId} {/* or Offer Title */}</h1>
              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les statuts</SelectItem>
                  <SelectItem value="SUBMITTED">Soumis</SelectItem>
                  <SelectItem value="UNDER_REVIEW">En cours d'examen</SelectItem>
                  <SelectItem value="INTERVIEW_SCHEDULED">Entretien prévu</SelectItem>
                  <SelectItem value="ACCEPTED">Accepté</SelectItem>
                  <SelectItem value="REJECTED">Refusé</SelectItem>
                  <SelectItem value="WITHDRAWN">Retiré</SelectItem>
                </SelectContent>
              </Select>
           </div>

          {filteredApplications.length > 0 ? (
             <Card>
                <CardContent className="p-0">
                   <Table>
                      <TableCaption>Liste des candidatures pour cette offre.</TableCaption>
                      <TableHeader>
                         <TableRow>
                            <TableHead>Candidat</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Date de soumission</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {filteredApplications.map((application) => (
                            <TableRow key={application.id}>
                               <TableCell className="font-medium">{application.student?.name || 'N/A'}</TableCell>
                               <TableCell>{getStatusBadge(application.status)}</TableCell>
                               <TableCell>{new Date(application.dateSubmitted).toLocaleDateString()}</TableCell>
                               <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                     <Link href={`/company/applications/view/${application.id}`}>
                                        <Button variant="outline" size="sm" title="Voir les détails">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                     </Link>
                                     {/* TODO: Add buttons/dropdown for status updates */}
                                  </div>
                               </TableCell>
                            </TableRow>
                         ))}
                      </TableBody>
                   </Table>
                </CardContent>
             </Card>
          ) : (
             <div className="text-center py-8 text-gray-500">
                Aucune candidature trouvée pour cette offre.
             </div>
          )}

        </div>
      </main>
      <Footer /> {/* Assuming Footer is suitable for both student and company */}
    </div>
  );
} 