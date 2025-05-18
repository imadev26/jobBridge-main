"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import { userService } from "@/lib/api"; // Note: lib/api.ts might have linter errors
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CompanyProfileData {
  name: string;
  description: string;
  website: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  // Add companyLogo if applicable and if the API handles it here
}

export default function CompanyProfilePage() {
  const router = useRouter();
  const { userId, isAuthenticated, role, isLoading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<CompanyProfileData | null>(null);
  const [loading, setLoading] = useState(true); // Loading state for fetching data
  const [submitting, setSubmitting] = useState(false); // Loading state for form submission
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

    // Auth loading is complete. Check if authenticated and is a COMPANY with userId.
    if (!isAuthenticated || role !== "COMPANY" || !userId) {
      console.log('Redirecting non-company or unauthenticated user to login');
      router.push("/login");
      return;
    }

    // User is authenticated and is a COMPANY with userId. Fetch profile data.
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Note: lib/api.ts might have linter errors that could affect this call.
        const response = await userService.getCompanyProfile(userId);
        console.log('Company profile fetched:', response.data);
        // Assuming the API returns the profile object directly
        setProfileData(response.data);
      } catch (err: any) {
        console.error("Error fetching company profile:", err);
        setError("Une erreur est survenue lors du chargement du profil de l'entreprise.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

  }, [isClient, authLoading, isAuthenticated, role, router, userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!userId || !profileData) {
        setError("User ID or profile data is missing. Cannot update.");
        setSubmitting(false);
        return;
    }

    try {
      // Note: lib/api.ts might have linter errors that could affect this call.
      const response = await userService.updateCompanyProfile(userId, profileData);
      console.log('Company profile update response:', response);
      toast.success("Profil de l'entreprise mis à jour avec succès!");
      // Optionally re-fetch profile data to ensure state is fresh
      // fetchProfile();
    } catch (err: any) {
      console.error("Error updating company profile:", err);
      const errorMessage = err.response?.data?.message || "Une erreur est survenue lors de la mise à jour du profil.";
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

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container mx-auto py-6 text-center">Chargement du profil...</div>
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
  if (!isAuthenticated || role !== "COMPANY" || !profileData) {
      return null; // Should ideally not reach here if loading and error states are handled
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav /> {/* Assuming MainNav is suitable for both student and company, or needs adaptation */}
      <main className="flex-1 bg-gray-100 p-4 md:p-8">
        <div className="container mx-auto max-w-2xl">
           <div className="mb-6">
             <h1 className="text-3xl font-bold">Profil de l'entreprise</h1>
          </div>

          <Card className="bg-white p-6 rounded-md shadow-md">
            <CardHeader className="p-0 mb-6">
                <CardTitle>Modifier les informations de l'entreprise</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Nom de l'entreprise</Label>
                  <Input id="name" name="name" value={profileData.name} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={profileData.description} onChange={handleInputChange} rows={4} required />
                </div>

                <div>
                  <Label htmlFor="website">Site Web</Label>
                  <Input id="website" name="website" value={profileData.website} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Input id="location" name="location" value={profileData.location} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="contactEmail">Email de contact</Label>
                  <Input id="contactEmail" name="contactEmail" type="email" value={profileData.contactEmail} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Téléphone de contact</Label>
                  <Input id="contactPhone" name="contactPhone" value={profileData.contactPhone} onChange={handleInputChange} />
                </div>

                {/* TODO: Add functionality for managing company logo if applicable */}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement en cours...</> : "Enregistrer les modifications"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer /> {/* Assuming Footer is suitable for both student and company */}
    </div>
  );
} 