"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { applicationService, offerService } from "@/lib/api";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { timeAgoInFrench } from "@/lib/utils"; // Assuming you have this utility

interface Application {
  id: string;
  studentId: string;
  offerId: string;
  cv: string;
  coverLetter: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "INTERVIEW_SCHEDULED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  dateSubmitted: string;
  lastUpdated: string;
  offer?: { // Include offer details to display job title and company
    title: string;
    company: string;
    location: string;
    companyLogo?: string; // Add optional companyLogo property
  };
}

export default function ApplicationsPage() {
  const router = useRouter();
  const { userId, isAuthenticated, isLoading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Wait for client-side rendering and auth state to finish loading
    if (!isClient || authLoading) {
      // While loading auth, do nothing and wait for authLoading to become false
      return;
    }

    // Auth loading is complete (`authLoading` is now false).

    // If the user is not authenticated at this point, redirect to login.
    if (!isAuthenticated) {
      console.log('Redirecting to login: isClient=', isClient, 'authLoading=', authLoading, 'isAuthenticated=', isAuthenticated);
      router.push("/login");
      return;
    }

    // If the user is authenticated and userId is available, fetch applications.
    // This part now runs only if isAuthenticated is true after loading.
    if (userId) {
       console.log('Attempting to fetch applications: isClient=', isClient, 'authLoading=', authLoading, 'isAuthenticated=', isAuthenticated, 'userId=', userId);
      const fetchApplications = async () => {
        setLoading(true);
        try {
          console.log('Fetching applications for student ID:', userId);
          const response = await applicationService.getStudentApplications(userId);
          console.log('Applications fetched:', response.data);
          // Assuming the API returns an array of application objects
          
          // Fetch offer details for each application
          const applicationsWithOffers = await Promise.all(response.data.map(async (app: Application) => {
            try {
              const offerResponse = await offerService.getOfferById(app.offerId);
              if (offerResponse.data) {
                return { ...app, offer: offerResponse.data };
              } else {
                console.error(`Failed to fetch offer details for offerId: ${app.offerId}`);
                return app; // Return application without offer details if fetch fails
              }
            } catch (offerError) {
              console.error(`Error fetching offer details for offerId: ${app.offerId}`, offerError);
              return app; // Return application without offer details on error
            }
          }));

          setApplications(applicationsWithOffers);
        } catch (err: any) {
          console.error("Error fetching applications:", err);
          setError("Une erreur est survenue lors du chargement des candidatures.");
        } finally {
          setLoading(false);
        }
      };

      fetchApplications();
    }
  }, [isClient, authLoading, isAuthenticated, userId, router]);

  const getStatusBadge = (status: Application['status']) => {
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

  // Filter applications by status
  const submittedApplications = applications.filter((app) => app.status === "SUBMITTED");
  const underReviewApplications = applications.filter((app) => app.status === "UNDER_REVIEW");
  const interviewScheduledApplications = applications.filter((app) => app.status === "INTERVIEW_SCHEDULED");
  const acceptedApplications = applications.filter((app) => app.status === "ACCEPTED");
  const rejectedApplications = applications.filter((app) => app.status === "REJECTED");
  const withdrawnApplications = applications.filter((app) => app.status === "WITHDRAWN");

  const renderApplicationCards = (apps: Application[]) => (
    apps.length > 0 ? (
      apps.map((application) => (
        // Assuming you have enough offer details nested in the application object
        application.offer ? (
        <Card key={application.id} className="relative">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-blue-600 text-white">
                {application.offer.companyLogo ? (
                  <img src={application.offer.companyLogo} alt={`${application.offer.company} logo`} className="h-full w-full object-contain rounded" />
                ) : (
                  application.offer.company ? application.offer.company.substring(0, 2).toUpperCase() : ''
                )}
              </div>
              <div className="grid gap-1">
                <h3 className="text-lg font-semibold">
                  <Link href={`/job/${application.offerId}`} className="hover:text-blue-600">
                    {application.offer.title}
                  </Link>
                </h3>
                <p className="text-gray-500">{application.offer.company}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <span>{application.offer.location}</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Candidature soumise {timeAgoInFrench(application.dateSubmitted)}
                </p>
                <div className="mt-2">
                  {getStatusBadge(application.status)}
                </div>
                {/* You can add more details here based on status if needed, like interview date */}
                {/* Example: */}
                 {application.status === "INTERVIEW_SCHEDULED" && (
                   <div className="mt-2 text-sm text-gray-600">
                      <p>Entretien prévu le: [Date de l'entretien]</p>
                   </div>
                 )}
                 {application.status === "ACCEPTED" && (
                   <div className="mt-2 text-sm text-gray-600">
                      <p>Félicitations! Votre candidature a été acceptée.</p>
                   </div>
                 )}
                 {application.status === "REJECTED" && (
                   <div className="mt-2 text-sm text-gray-600">
                      <p>Votre candidature n'a pas été retenue cette fois-ci.</p>
                   </div>
                 )}
              </div>
            </div>
          </CardContent>
        </Card>
        ) : null // Don't render if offer details are missing
      ))
    ) : (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-500">Aucune candidature trouvée.</p>
        <Link href="/search" className="mt-4">
          {/* Assuming you have a Button component from shadcn/ui */} {/* <Button>Parcourir les offres</Button> */}
          <span className="text-blue-600 hover:underline">Parcourir les offres disponibles</span>
        </Link>
      </div>
    )
  );

  if (authLoading) {
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
          <div className="container mx-auto py-6 text-center text-red-500">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6 md:py-8 mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-2">
            {/* Assuming you want a back link */}
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
            <h1 className="text-2xl font-bold">Mes candidatures</h1>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-6 grid w-full grid-cols-6 rounded-lg"> {/* Adjusted grid-cols */}
              <TabsTrigger value="all">Toutes ({applications.length})</TabsTrigger>
              <TabsTrigger value="submitted">Soumis ({submittedApplications.length})</TabsTrigger>
              <TabsTrigger value="under_review">En cours ({underReviewApplications.length})</TabsTrigger>
              <TabsTrigger value="interview_scheduled">Entretien ({interviewScheduledApplications.length})</TabsTrigger>
              <TabsTrigger value="accepted">Acceptées ({acceptedApplications.length})</TabsTrigger>
              <TabsTrigger value="rejected">Refusées ({rejectedApplications.length})</TabsTrigger>
              {/* Add trigger for WITHDRAWN if needed */}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {renderApplicationCards(applications)}
            </TabsContent>

            <TabsContent value="submitted" className="space-y-4">
              {renderApplicationCards(submittedApplications)}
            </TabsContent>

             <TabsContent value="under_review" className="space-y-4">
              {renderApplicationCards(underReviewApplications)}
            </TabsContent>

             <TabsContent value="interview_scheduled" className="space-y-4">
              {renderApplicationCards(interviewScheduledApplications)}
            </TabsContent>

            <TabsContent value="accepted" className="space-y-4">
              {renderApplicationCards(acceptedApplications)}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {renderApplicationCards(rejectedApplications)}
            </TabsContent>

             {/* Add TabsContent for WITHDRAWN if needed */}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
} 