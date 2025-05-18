"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import { offerService } from "@/lib/api"; // Note: lib/api.ts might have linter errors
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CompanyOffer {
  id: string;
  title: string;
  location: string;
  status: string; // Assuming status is a string, adjust if needed
  // Add other relevant offer fields here based on your API response
}

export default function CompanyOffersPage() {
  const router = useRouter();
  const { isAuthenticated, role, isLoading: authLoading, userId } = useAuth();
  const [offers, setOffers] = useState<CompanyOffer[]>([]);
  const [loading, setLoading] = useState(true);
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

    // User is authenticated and is a COMPANY. Fetch offers.
    const fetchOffers = async () => {
      try {
        setLoading(true);
        // Note: lib/api.ts might have linter errors that could affect this call.
        if (!userId) {
           setError("Company user ID is missing.");
           setLoading(false);
           return;
        }
        const response = await offerService.getAllOfferscompany(userId);
        console.log('Company offers fetched:', response.data);
        // Assuming the API returns an array of offer objects directly
        setOffers(response.data);
      } catch (err: any) {
        console.error("Error fetching company offers:", err);
        setError("Une erreur est survenue lors du chargement des offres.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();

  }, [isClient, authLoading, isAuthenticated, role, router, userId]);

  const handleDeleteOffer = async (offerId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      return;
    }

    try {
      // Note: lib/api.ts might have linter errors that could affect this call.
      await offerService.deleteOffer(offerId);
      console.log('Offer deleted with ID:', offerId);
      // Filter out the deleted offer from the local state
      setOffers(offers.filter(offer => offer.id !== offerId));
      toast.success("Offre supprimée avec succès!");
    } catch (err: any) {
      console.error("Error deleting offer:", err);
      const errorMessage = err.response?.data?.message || "Une erreur est survenue lors de la suppression de l'offre.";
      // Optionally, fetch offers again if deleting failed to ensure state is consistent
      // fetchOffers(); 
      toast.error(errorMessage);
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
          <div className="container mx-auto py-6 text-center">Chargement des offres...</div>
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

  // Render offers list
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav /> {/* Assuming MainNav is suitable for both student and company, or needs adaptation */}
      <main className="flex-1 bg-gray-100 p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-6">
             <h1 className="text-3xl font-bold">Gestion des offres</h1>
             <Link href="/company/offers/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une nouvelle offre
                </Button>
             </Link>
          </div>

          {offers.length > 0 ? (
             <Card>
                <CardContent className="p-0">
                   <Table>
                      <TableCaption>Liste de vos offres postées.</TableCaption>
                      <TableHeader>
                         <TableRow>
                            <TableHead>Titre</TableHead>
                            <TableHead>Lieu</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Candidatures</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {offers.map((offer) => (
                            <TableRow key={offer.id}>
                               <TableCell className="font-medium"><Link href={`/job/${offer.id}`} className="hover:underline">{offer.title}</Link></TableCell>
                               <TableCell>{offer.location}</TableCell>
                               <TableCell>{offer.status}</TableCell>
                               <TableCell>
                                   <Link href={`/company/applications/${offer.id}`} className="text-blue-600 hover:underline">
                                      Voir les candidatures
                                   </Link>
                               </TableCell>
                               <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                     <Link href={`/company/offers/edit/${offer.id}`}><Button variant="outline" size="sm"><Pencil className="h-4 w-4" /></Button></Link>
                                     <Button variant="destructive" size="sm" onClick={() => handleDeleteOffer(offer.id)}><Trash2 className="h-4 w-4" /></Button>
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
                Aucune offre trouvée. <Link href="/company/offers/create" className="text-blue-600 hover:underline">Créez-en une maintenant !</Link>
             </div>
          )}

        </div>
      </main>
      <Footer /> {/* Assuming Footer is suitable for both student and company */}
    </div>
  );
} 