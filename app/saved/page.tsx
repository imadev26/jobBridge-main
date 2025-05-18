"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { timeAgoInFrench } from "@/lib/utils"
import Link from "next/link"
import { offerService } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeft, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface JobOffer {
  id: string
  title: string
  company: string
  location: string
  description: string
  requirements: string | string[]
  salary: string
  type: string
  createdAt: string
}

export default function SavedOffersPage() {
  const [savedOffers, setSavedOffers] = useState<JobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, role, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []); // This effect runs only once on the client after initial render

  useEffect(() => {
    // Only run this effect if the component is mounted on the client and authentication is not loading
    if (isClient && !authLoading) {
      if (!isAuthenticated || role !== "STUDENT") {
        console.log('User not authenticated or not a student, redirecting to login');
        router.push("/login");
        return;
      }

      const fetchSavedOffers = async () => {
        try {
          // Read from localStorage only when on the client
          const savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
          console.log('Raw localStorage savedJobs:', localStorage.getItem('savedJobs'));
          console.log('Parsed saved job IDs:', savedJobIds);
          
          if (savedJobIds.length === 0) {
            console.log('No saved jobs found in localStorage');
            setLoading(false);
            return;
          }

          console.log('Fetching details for saved jobs...');
          const offers = await Promise.all(
            savedJobIds.map(async (id: string) => {
              if (typeof id !== 'string') {
                console.error(`Invalid saved job ID found in localStorage: ${id}`);
                return null;
              }
              try {
                console.log(`Fetching offer with ID: ${id}`);
                const response = await offerService.getOfferById(id);
                if (!response.data) {
                  console.error(`No data returned for offer ${id}`);
                  return null;
                }
                console.log(`Successfully fetched offer ${id}:`, response.data);
                return response.data;
              } catch (err) {
                console.error(`Error fetching offer ${id}:`, err);
                return null;
              }
            })
          );
          
          const validOffers: JobOffer[] = offers.filter((offer): offer is JobOffer => 
            offer !== null && 
            typeof offer === 'object' && 
            'id' in offer && 
            'title' in offer && 
            'company' in offer
          );
          
          console.log('Valid offers after filtering:', validOffers);
          setSavedOffers(validOffers);
          console.log('SavedOffers state after setting:', validOffers);
        } catch (err) {
          console.error("Error in fetchSavedOffers:", err);
          setError("Une erreur est survenue lors du chargement des offres sauvegardées.");
        } finally {
          setLoading(false);
        }
      };

      fetchSavedOffers();
    }
  }, [isClient, authLoading, isAuthenticated, role, router]); // Add isClient to the dependency array

  const handleRemoveJob = (jobId: string) => {
    try {
      const updatedJobs = savedOffers.filter((job) => job.id !== jobId);
      const savedJobIds = updatedJobs.map(job => job.id);
      localStorage.setItem('savedJobs', JSON.stringify(savedJobIds));
      setSavedOffers(updatedJobs);
      console.log('Job removed, updated saved jobs:', savedJobIds);
    } catch (err) {
      console.error('Error removing job:', err);
      toast.error("Une erreur est survenue lors de la suppression de l'offre.");
    }
  };

  const handleJobClick = (jobId: string) => {
    router.push(`/job/${jobId}`)
  }

  const filteredJobs = savedOffers.filter((job) => {
    if (!job) {
      console.log('Filtered out null job');
      return false;
    }
    const searchLower = searchQuery.toLowerCase();
    const matches = (
      job.title.toLowerCase().includes(searchLower) ||
      job.company.toLowerCase().includes(searchLower) ||
      job.location.toLowerCase().includes(searchLower) ||
      job.description.toLowerCase().includes(searchLower)
    );
    if (!matches) {
      console.log('Job filtered out by search:', job.title);
    }
    return matches;
  });
  console.log('Filtered jobs before rendering:', filteredJobs);

  // Log which rendering path is being taken
  if (filteredJobs.length === 0) {
    console.log('Rendering empty state branch.');
  } else {
    console.log('Rendering grid with offers branch.');
  }

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container mx-auto py-6 text-center">Chargement...</div>
        </main>
        <Footer />
      </div>
    )
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
    )
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
            <h1 className="text-2xl font-bold">Offres sauvegardées</h1>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher dans vos offres sauvegardées"
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {/* {console.log('Rendering empty state. filteredJobs.length:', filteredJobs.length)} */}
              <p className="text-gray-500">
                {searchQuery ? "Aucun résultat pour your recherche." : "You n'avez pas encore sauvegardé d'offres."}
              </p>
              <Link href="/search" className="mt-4">
                <Button>Parcourir les offres</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {/* {console.log('Rendering grid with offers. filteredJobs.length:', filteredJobs.length)} */}
              {filteredJobs.map((job) => {
                if (!job || !job.id) return null;

                console.log('Rendering job:', job);

                return (
                  <Card key={job.id} className="relative cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleJobClick(job.id)}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {job && job.company ? job.company.substring(0, 2).toUpperCase() : ''}
                        <div className="grid gap-1">
                          <h3 className="text-lg font-semibold">
                            {job.title}
                          </h3>
                          <p className="text-gray-500">{job.company}</p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span>{job.location}</span>
                            <span>•</span>
                            <span>{job.type}</span>
                          </div>
                          <div className="mt-2">
                            <Badge
                              variant="outline"
                              className={
                                job.type === "Stage" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                              }
                            >
                              {job.type}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">Publié {timeAgoInFrench(job.createdAt)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveJob(job.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
