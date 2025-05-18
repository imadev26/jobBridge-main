"use client"

import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { SearchFilters } from "@/components/search-filters"
import { useState, useEffect } from "react"
import { jobService } from "@/lib/api"

interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  duration?: string;
  sector: string;
  description: string;
  requirements?: string;
  companyId: string;
  createdAt: string;
  type?: string;
  companyLogo?: string;
}

function timeAgoInFrench(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  if (seconds < 60) return "Il y a quelques secondes";
  if (minutes < 60) return `Il y a ${minutes} minutes`;
  if (hours < 24) return `Il y a ${hours} heures`;
  if (days < 7) return `Il y a ${days} jours`;
  if (weeks < 4) return `Il y a ${weeks} semaines`;
  if (months < 12) return `Il y a ${months} mois`;
  return `Il y a ${years} ans`;
}

export default function SearchPage() {
  const [jobs, setJobs] = useState<JobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    sector: "",
    location: "",
    duration: "",
    type: "all"
  })

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobService.getRecommendedJobs()
        console.log('Fetched jobs:', data)
        setJobs(data)
      } catch (err: any) {
        console.error('Error fetching jobs:', err)
        setError(err.message || "Failed to fetch jobs")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === "" || 
      (typeof job.title === 'string' && job.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof job.company === 'string' && job.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof job.description === 'string' && job.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesSector = !filters.sector || (typeof job.sector === 'string' && job.sector === filters.sector)
    const matchesLocation = !filters.location || (typeof job.location === 'string' && job.location.toLowerCase().includes(filters.location.toLowerCase()))
    const matchesDuration = !filters.duration || (typeof job.duration === 'string' && job.duration.toLowerCase().includes(filters.duration.toLowerCase()))
    const matchesType = filters.type === "all" || (typeof job.type === 'string' && job.type === filters.type)

    return matchesSearch && matchesSector && matchesLocation && matchesDuration && matchesType
  })

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
            <h1 className="text-2xl font-bold">Résultats de recherche</h1>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher un stage ou une alternance"
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SearchFilters onFiltersChange={handleFiltersChange} />
          </div>

          <div className="grid gap-6">
            {loading && <div className="text-center py-8">Chargement des offres...</div>}
            {error && <div className="text-center py-8 text-red-500">Erreur: {error}</div>}
            {!loading && !error && filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <Link key={job.id} href={`/job/${job.id}`} className="group">
                  <Card className="transition-all group-hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-blue-600 text-white">
                          {job.companyLogo ? (
                            <img src={job.companyLogo} alt={job.company || 'Company'} className="h-full w-full object-cover rounded" />
                          ) : (
                            <span>{typeof job.company === 'string' && job.company.length > 1 ? job.company.substring(0, 2).toUpperCase() : 'U'}</span>
                          )}
                        </div>
                        <div className="grid gap-1">
                          <h3 className="text-lg font-semibold">{job.title || 'Sans titre'}</h3>
                          <p className="text-gray-500">{job.company || 'Entreprise non spécifiée'}</p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span>{job.location || 'Lieu non spécifié'}</span>
                            {job.duration && (
                              <>
                                <span>•</span>
                                <span>{job.duration}</span>
                              </>
                            )}
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-blue-100 text-blue-700">
                              {job.sector || 'Secteur non spécifié'}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Publié {timeAgoInFrench(job.createdAt || '')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchQuery || Object.values(filters).some(v => v !== "" && v !== "all")
                    ? "Aucune offre ne correspond à vos critères de recherche."
                    : "Aucune offre disponible pour le moment."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
