"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import { offerService, applicationService } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CompanyInterviewsPage() {
  const router = useRouter();
  const { isAuthenticated, role, isLoading: authLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [scheduledApplications, setScheduledApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [errorLoadingApplications, setErrorLoadingApplications] = useState<string | null>(null);

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
    }

    // User is authenticated and is a COMPANY. Fetch scheduled interviews.
    const fetchScheduledInterviews = async () => {
      try {
        setLoadingApplications(true);
        setErrorLoadingApplications(null);

        // 1. Fetch all offers for the company
        // Note: lib/api.ts might have linter errors that could affect this call.
        const offersResponse = await offerService.getAllOffers();
        const offers = offersResponse.data; // Assuming API returns array of offers

        let allScheduled: any[] = [];

        // 2. For each offer, fetch its applications and filter for INTERVIEW_SCHEDULED
        for (const offer of offers) {
          try {
            // Note: lib/api.ts might have linter errors that could affect this call.
            const applicationsResponse = await applicationService.getOfferApplications(offer.id);
            const applicationsForOffer: any[] = applicationsResponse.data; // Assuming API returns array

            const scheduled = applicationsForOffer
              .filter(app => app.status === "INTERVIEW_SCHEDULED")
              .map(app => ({ ...app, offerTitle: offer.title })); // Add offer title for display

            allScheduled = [...allScheduled, ...scheduled];

          } catch (err: any) {
             console.error(`Error fetching applications for offer ${offer.id}:`, err);
             // Continue fetching for other offers even if one fails
          }
        }

        setScheduledApplications(allScheduled);

      } catch (err: any) {
        console.error("Error fetching offers or applications:", err);
        setErrorLoadingApplications("Une erreur est survenue lors du chargement des entretiens planifiés.");
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchScheduledInterviews();

  }, [isClient, authLoading, isAuthenticated, role, router]);

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

  // Render content only if authenticated and is COMPANY
  if (!isAuthenticated || role !== "COMPANY") {
      return null; // Or render an access denied message
  }

  if (loadingApplications) {
     return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container mx-auto py-6 text-center">Chargement des entretiens planifiés...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (errorLoadingApplications) {
     return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container mx-auto py-6 text-center text-red-500">Erreur: {errorLoadingApplications}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav /> {/* Assuming MainNav is suitable for both student and company, or needs adaptation */}
      <main className="flex-1 bg-gray-100 p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
           <div className="mb-6">
             <h1 className="text-3xl font-bold">Entretiens Planifiés</h1>
          </div>

          {scheduledApplications.length > 0 ? (
              <Card>
                 <CardContent className="p-0">
                    <Table>
                       <caption>Liste des candidatures avec un entretien planifié.</caption>
                       <TableHeader>
                          <TableRow>
                             <TableHead>Candidat</TableHead>
                             <TableHead>Offre</TableHead>
                             <TableHead>Statut</TableHead>
                             <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {scheduledApplications.map((application) => (
                             <TableRow key={application.id}>
                                <TableCell className="font-medium">{application.student?.name || 'N/A'}</TableCell>
                                <TableCell>{application.offerTitle || 'N/A'}</TableCell>
                                <TableCell><Badge variant="outline" className="bg-orange-100 text-orange-700">Entretien prévu</Badge></TableCell>
                                <TableCell className="text-right">
                                   <div className="flex justify-end space-x-2">
                                      {/* Link to view application details page */}
                                      <Link href={`/company/applications/view/${application.id}`}>
                                         <Button variant="outline" size="sm" title="Voir les détails">
                                             <Eye className="h-4 w-4" />
                                         </Button>
                                      </Link>
                                   </div>
                                </TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </CardContent>
              </Card>
          ) : (
             <div className="bg-white p-6 rounded-md shadow-md text-center text-gray-500">
                Aucun entretien planifié trouvé.
             </div>
          )}

        </div>
      </main>
      <Footer /> {/* Assuming Footer is suitable for both student and company */}
    </div>
  );
} 