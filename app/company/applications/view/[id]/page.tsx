"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import { applicationService, userService, offerService } from "@/lib/api"; // Note: lib/api.ts might have linter errors
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, FileText, Download } from "lucide-react";

// Define Application interface based on expected GET /applications/{id} response
interface ApplicationDetail {
  id: string;
  studentId: string;
  offerId: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "INTERVIEW_SCHEDULED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  dateSubmitted: string;
  lastUpdated: string;
  cv: string; // Assuming CV is a downloadable URL or base64 string
  coverLetter: string; // Assuming Cover Letter is a string or base64 string
  student?: { 
    id: string;
    name: string;
    email: string;
    // Add other student details if provided by API
  };
  offer?: {
    id: string;
    title: string;
    company: string;
    location: string;
    // Add other offer details if provided by API
  };
}

export default function CompanyApplicationViewPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { isAuthenticated, role, isLoading: authLoading } = useAuth();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

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

    // User is authenticated and is a COMPANY. Fetch application details.
    const fetchApplicationDetails = async () => {
      if (!applicationId) {
         setError("Application ID is missing.");
         setLoading(false);
         return;
      }
      try {
        setLoading(true);
        // Note: lib/api.ts might have linter errors that could affect this call.
        console.log("Attempting to fetch application details with token:", localStorage.getItem("token"));
        const appResponse = await applicationService.getApplicationById(applicationId);
        console.log('Application details fetched:', appResponse.data);

        const applicationData = appResponse.data;

        // Fetch student and offer details using the IDs from the application data
        const studentResponse = await userService.getStudentProfile(applicationData.studentId);
        const offerResponse = await offerService.getOfferById(applicationData.offerId);

        console.log('Student details fetched:', studentResponse.data);
        console.log('Offer details fetched:', offerResponse.data);

        // Combine the data
        const combinedApplication: ApplicationDetail = {
            ...applicationData,
            student: studentResponse.data,
            offer: offerResponse.data,
        };

        setApplication(combinedApplication);

      } catch (err: any) {
        console.error("Error fetching application details:", err);
        // Check if the error is a 403 Forbidden and provide a specific message
        if (err.response && err.response.status === 403) {
             setError("Vous n'êtes pas autorisé à voir les détails de cette candidature. Assurez-vous que l'offre associée appartient à votre entreprise.");
        } else {
             setError("Une erreur est survenue lors du chargement des détails de la candidature.");
        }

      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();

  }, [isClient, authLoading, isAuthenticated, role, router, applicationId]);

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
        case "WITHDRAWN":
          return <Badge variant="secondary">Retiré</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
  };

  const handleStatusUpdate = async (newStatus: ApplicationDetail['status']) => {
      if (!applicationId) return;
      setUpdatingStatus(true);
      try {
          // Note: lib/api.ts might have linter errors that could affect this call.
          await applicationService.updateApplicationStatus(applicationId, newStatus);
          console.log(`Application ${applicationId} status updated to ${newStatus}`);
          toast.success("Statut de la candidature mis à jour!");
          // Update the local state with the new status
          setApplication(prev => prev ? { ...prev, status: newStatus } : null);
      } catch (err: any) {
          console.error("Error updating application status:", err);
          const errorMessage = err.response?.data?.message || "Une erreur est survenue lors de la mise à jour du statut.";
          toast.error(errorMessage);
      } finally {
          setUpdatingStatus(false);
      }
  };

  // Helper function to download Base64 file
  const downloadBase64File = (base64Data: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error downloading file:", e);
      toast.error("Erreur lors du téléchargement du fichier.");
    }
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
          <div className="container mx-auto py-6 text-center">Chargement des détails de la candidature...</div>
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

  // Render application details if loaded
  if (!application) {
      return (
         <div className="flex min-h-screen flex-col">
            <MainNav />
            <main className="flex-1">
              <div className="container mx-auto py-6 text-center text-gray-500">Candidature introuvable.</div>
            </main>
            <Footer />
         </div>
      );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav /> {/* Assuming MainNav is suitable for both student and company, or needs adaptation */}
      <main className="flex-1 bg-gray-100 p-4 md:p-8">
        <div className="container mx-auto max-w-3xl">
           <div className="mb-6 flex items-center gap-2">
             {/* Link back to applications list for this offer - need offerId */}
             {/* For now, link back to a general offers list or dashboard if offerId is not easily available here */}
             <Link href="/company/offers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
               <ArrowLeft className="h-4 w-4" />
               Retour aux offres
             </Link>
             <h1 className="text-3xl font-bold">Détails de la candidature</h1>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Offre Postée</h3>
                <p><strong>Titre:</strong> {application.offer?.title || 'N/A'}</p>
                <p><strong>Entreprise:</strong> {application.offer?.company || 'N/A'}</p>
                 <p><strong>Lieu:</strong> {application.offer?.location || 'N/A'}</p>
                {/* Link to offer details if needed */}
                {/* {application.offer?.id && <Link href={`/job/${application.offer.id}`} className="text-blue-600 hover:underline">Voir l'offre complète</Link>} */}
              </div>

              <div>
                <h3 className="text-lg font-semibold">Informations Candidat</h3>
                <p><strong>Nom:</strong> {application.student?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {application.student?.email || 'N/A'}</p>
                 {/* Link to student profile if needed */}
                 {/* {application.student?.id && <Link href={`/company/students/${application.student.id}`} className="text-blue-600 hover:underline">Voir profil</Link>} */}
              </div>

              <div>
                <h3 className="text-lg font-semibold">Statut de la candidature</h3>
                {getStatusBadge(application.status)}
                 <p className="text-sm text-gray-600 mt-1">Soumis le: {new Date(application.dateSubmitted).toLocaleDateString()}</p>
                 {application.status !== "SUBMITTED" && <p className="text-sm text-gray-600">Dernière mise à jour: {new Date(application.lastUpdated).toLocaleDateString()}</p>}
              </div>

              <div>
                <h3 className="text-lg font-semibold">Documents</h3>
                <div className="flex items-center space-x-4 mt-2">
                  {application.cv ? (
                    <Button variant="outline" onClick={() => downloadBase64File(application.cv, 'cv.pdf')}><Download className="mr-2 h-4 w-4" /> Télécharger CV</Button>
                  ) : (
                     <span className="text-gray-500">CV non fourni</span>
                  )}
                  {application.coverLetter ? (
                    <Button variant="outline" onClick={() => downloadBase64File(application.coverLetter, 'lettre_motivation.pdf')}><Download className="mr-2 h-4 w-4" /> Télécharger Lettre de motivation</Button>
                  ) : (
                    <span className="text-gray-500">Lettre de motivation non fournie</span>
                  )}
                </div>
                 {/* If CV/Cover Letter are URLs instead of Base64, use <a> tags */} 
                 {/* Example for URL: */}
                 {/* {application.cv && (<a href={application.cv} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center"><FileText className="mr-1 h-4 w-4" /> Voir CV</a>)} */}
              </div>

               {/* Status Update Section */}
               <div>
                 <h3 className="text-lg font-semibold">Mettre à jour le statut</h3>
                 <div className="flex flex-wrap gap-2 mt-2">
                    {/* Button to set status to UNDER_REVIEW */}
                    {application.status !== "UNDER_REVIEW" && application.status !== "INTERVIEW_SCHEDULED" && application.status !== "ACCEPTED" && application.status !== "REJECTED" && (
                       <Button 
                         variant="outline" 
                         onClick={() => handleStatusUpdate("UNDER_REVIEW")}
                         disabled={updatingStatus}
                       >
                         Passer en "En cours d'examen"
                       </Button>
                    )}
                     {/* Button to set status to INTERVIEW_SCHEDULED */}
                     {application.status !== "INTERVIEW_SCHEDULED" && application.status !== "ACCEPTED" && application.status !== "REJECTED" && (
                       <Button 
                         variant="outline" 
                         onClick={() => handleStatusUpdate("INTERVIEW_SCHEDULED")}
                          disabled={updatingStatus}
                       >
                         Planifier un entretien
                       </Button>
                    )}
                     {/* Button to set status to ACCEPTED */}
                     {application.status !== "ACCEPTED" && application.status !== "REJECTED" && (
                       <Button 
                         variant="outline" 
                         onClick={() => handleStatusUpdate("ACCEPTED")}
                          disabled={updatingStatus}
                       >
                         Accepter
                       </Button>
                    )}
                     {/* Button to set status to REJECTED */}
                     {application.status !== "REJECTED" && application.status !== "ACCEPTED" && (
                       <Button 
                         variant="destructive" 
                         onClick={() => handleStatusUpdate("REJECTED")}
                          disabled={updatingStatus}
                       >
                         Refuser
                       </Button>
                    )}
                     {/* Button to set status to WITHDRAWN - assuming this can be done by company */}
                     {application.status !== "WITHDRAWN" && application.status !== "ACCEPTED" && application.status !== "REJECTED" && (
                       <Button 
                         variant="outline" 
                         onClick={() => handleStatusUpdate("WITHDRAWN")}
                          disabled={updatingStatus}
                       >
                         Retirer la candidature
                       </Button>
                    )}
                 </div>
               </div>

            </CardContent>
          </Card>

        </div>
      </main>
      <Footer /> {/* Assuming Footer is suitable for both student and company */}
    </div>
  );
} 