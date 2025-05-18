"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import { offerService } from "@/lib/api"; // Note: lib/api.ts might have linter errors
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface OfferData {
  title: string;
  description: string;
  sector: string;
  location: string;
  duration: string;
  requirements: string;
  // Add status if needed for editing, though API guide doesn't list it for update body
}

export default function EditOfferPage() {
  const router = useRouter();
  const params = useParams();
  const offerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { isAuthenticated, role, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState<OfferData>({ // Use OfferData interface
    title: "",
    description: "",
    sector: "",
    location: "",
    duration: "",
    requirements: "",
  });
  const [loading, setLoading] = useState(true); // Set to true initially to load existing data
  const [submitting, setSubmitting] = useState(false); // For form submission loading
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

    // User is authenticated and is a COMPANY. Fetch offer data.
    const fetchOfferData = async () => {
      try {
        setLoading(true); // Loading state for fetching existing data
        // Note: lib/api.ts might have linter errors that could affect this call.
        // Ensure offerId is a string before passing to the service
        const idString = Array.isArray(offerId) ? offerId[0] : offerId;
        if (!idString) {
             setError("Offer ID is missing.");
             setLoading(false);
             return;
        }
        const response = await offerService.getOfferById(idString);
        console.log('Offer data fetched for editing:', response.data);
        // Populate the form with fetched data. Ensure data structure matches OfferData.
        // Add status if needed for editing, though API guide doesn't list it for update body
        setFormData(response.data); // Assuming response.data structure is compatible
      } catch (err: any) {
        console.error("Error fetching offer data:", err);
        setError("Une erreur est survenue lors du chargement des données de l'offre.");
      } finally {
        setLoading(false);
      }
    };

    // Trigger fetch when offerId is available and component is ready
    if (offerId && isClient && !authLoading && isAuthenticated && role === "COMPANY") {
      fetchOfferData();
    } else if (!offerId && isClient && !authLoading && isAuthenticated && role === "COMPANY") {
       // If offerId is missing when auth is ready, show an error
       setError("Offer ID is missing.");
       setLoading(false);
    }

  }, [isClient, authLoading, isAuthenticated, role, router, offerId]); // Add offerId to dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); // Use submitting state for form submission
    setError(null);

    // Ensure offerId is available and is a string before submitting
     const idString = Array.isArray(offerId) ? offerId[0] : offerId;
    if (!idString) {
      setError("Offer ID is missing. Cannot update.");
      setSubmitting(false);
      return;
    }

    try {
      // Note: lib/api.ts might have linter errors that could affect this call.
      const response = await offerService.updateOffer(idString, formData);
      console.log('Offer update response:', response);
      toast.success("Offre modifiée avec succès!");
      // Redirect back to the offers list page
      router.push("/company/offers");
    } catch (err: any) {
      console.error("Error updating offer:", err);
      const errorMessage = err.response?.data?.message || "Une erreur est survenue lors de la modification de l'offre.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
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

  // Render loading state for fetching offer data
  if (loading) {
    return (
       <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container mx-auto py-6 text-center">Chargement des données de l'offre...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !loading) { // Display error only if not currently loading initial data
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

  // Render form only if authenticated, is COMPANY, and data is loaded without error
  if (!isAuthenticated || role !== "COMPANY" || !formData) {
      return null; // Should ideally not reach here if loading and error states are handled
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav /> {/* Assuming MainNav is suitable for both student and company, or needs adaptation */}
      <main className="flex-1 bg-gray-100 p-4 md:p-8">
        <div className="container mx-auto max-w-2xl">
           <div className="mb-6 flex items-center gap-2">
            <Link href="/company/offers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" />
              Retour aux offres
            </Link>
             <h1 className="text-3xl font-bold">Modifier l'offre</h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md shadow-md space-y-6">
            <div>
              <Label htmlFor="title">Titre de l'offre</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} required />
            </div>

            <div>
              <Label htmlFor="sector">Secteur</Label>
              <Input id="sector" name="sector" value={formData.sector} onChange={handleInputChange} required />
            </div>

            <div>
              <Label htmlFor="location">Lieu</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleInputChange} required />
            </div>

            <div>
              <Label htmlFor="duration">Durée</Label>
              <Input id="duration" name="duration" value={formData.duration} onChange={handleInputChange} required />
            </div>

            <div>
              <Label htmlFor="requirements">Prérequis</Label>
              <Textarea id="requirements" name="requirements" value={formData.requirements} onChange={handleInputChange} rows={3} required />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Enregistrement en cours..." : "Enregistrer les modifications"}
            </Button>
          </form>

        </div>
      </main>
      <Footer /> {/* Assuming Footer is suitable for both student and company */}
    </div>
  );
} 