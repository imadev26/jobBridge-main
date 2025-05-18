"use client"

import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Briefcase, BookOpen, FileText } from "lucide-react"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { SearchFilters } from "@/components/search-filters"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { jobService } from "@/lib/api"
import React from "react"
import { timeAgoInFrench } from "@/lib/utils"

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

export default function Home() {
  const [recommendedJobs, setRecommendedJobs] = useState<JobOffer[]>([])
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
    const fetchRecommendedJobs = async () => {
      try {
        const data = await jobService.getRecommendedJobs()
        console.log('Fetched recommended jobs:', data)
        console.log('Data type:', typeof data)
        console.log('Is array?', Array.isArray(data))
        console.log('Length:', data?.length)
        setRecommendedJobs(data)
      } catch (err: any) {
        console.error('Error fetching recommended jobs:', err)
        setError(err.message || "Failed to fetch recommended jobs")
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendedJobs()
  }, [])

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const filteredJobs = recommendedJobs.filter(job => {
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
        {/* Hero Section */}
        <section className="relative py-12 md:py-24">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
              alt="Professionnels travaillant ensemble"
              fill
              className="object-cover brightness-50"
              priority
            />
          </div>
          <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-6xl">
                    JobBridge
                  </h1>
                  <p className="max-w-[600px] text-white md:text-xl">Votre passerelle vers l&apos;emploi public</p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Rechercher par poste, entreprise ou mot-clé"
                      className="w-full bg-white pl-8 rounded-md"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <SearchFilters onFiltersChange={handleFiltersChange} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-2 text-center">
                <div className="text-3xl font-bold text-blue-600 sm:text-4xl">250+</div>
                <div className="text-lg text-gray-500 sm:text-xl">Stages</div>
              </div>
              <div className="flex flex-col justify-center space-y-2 text-center">
                <div className="text-3xl font-bold text-blue-600 sm:text-4xl">75+</div>
                <div className="text-lg text-gray-500 sm:text-xl">Entreprises</div>
              </div>
              <div className="flex flex-col justify-center space-y-2 text-center">
                <div className="text-3xl font-bold text-blue-600 sm:text-4xl">1,200+</div>
                <div className="text-lg text-gray-500 sm:text-xl">Étudiants</div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-gray-50 py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Explorer par domaine</h2>
                <p className="text-gray-500">Découvrez les opportunités par secteur d&apos;activité</p>
              </div>
              <Link href="/search" className="text-blue-600 hover:underline">
                Voir tout
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <Card key="sector-technologie" className="transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-blue-100 p-3">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium">Technologie</h3>
                  <p className="text-sm text-gray-500">47 offres</p>
                </CardContent>
              </Card>
              <Card key="sector-education" className="transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-blue-100 p-3">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium">Éducation</h3>
                  <p className="text-sm text-gray-500">32 offres</p>
                </CardContent>
              </Card>
              <Card key="sector-administration" className="transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-blue-100 p-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium">Administration</h3>
                  <p className="text-sm text-gray-500">25 offres</p>
                </CardContent>
              </Card>
              <Card key="sector-finance" className="transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-blue-100 p-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium">Finance</h3>
                  <p className="text-sm text-gray-500">18 offres</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Recommended Offers */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Offres recommandées</h2>
                <p className="text-gray-500">Sélectionnées selon votre profil</p>
              </div>
              <Link href="/search" className="text-blue-600 hover:underline">
                Voir tout
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {loading && <div key="loading-status"><p>Chargement des offres recommandées...</p></div>}
              {error && <div key="error-status"><p className="text-red-500">Erreur: {error}</p></div>}
              {!loading && !error && filteredJobs.length > 0 ? (
                filteredJobs.map((job) => {
                  if (!job || !job.id) return null;
                  return (
                    <Link key={job.id} href={`/job/${job.id}`} className="group">
                      <Card className="h-full transition-all group-hover:shadow-md">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-blue-600 text-white">
                              {job.companyLogo ? (
                                <img src={job.companyLogo} alt={job.company || 'Company'} className="h-full w-full object-cover rounded" />
                              ) : (
                                <span>{typeof job.company === 'string' && job.company.length > 1 ? job.company.substring(0, 2).toUpperCase() : 'U'}</span>
                              )}
                            </div>
                            <div className="grid gap-1">
                              <h3 className="font-semibold">{job.title || 'Sans titre'}</h3>
                              <p className="text-sm text-gray-500">{job.company || 'Entreprise non spécifiée'}</p>
                              <p className="text-sm text-gray-600 mt-1">{job.description || 'Aucune description disponible'}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{job.location || 'Lieu non spécifié'}</span>
                                {job.duration && (
                                  <>
                                    <span>•</span>
                                    <span>{job.duration}</span>
                                  </>
                                )}
                              </div>
                              <div className="mt-2">
                                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                                  {job.sector || 'Secteur non spécifié'}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-gray-500">
                                Publié {timeAgoInFrench(job.createdAt || '')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              ) : (
                <div key="no-offers" className="col-span-full text-center py-8">
                  <p className="text-gray-500">
                    {searchQuery || Object.values(filters).some(v => v !== "" && v !== "all") 
                      ? "Aucune offre ne correspond à vos critères de recherche."
                      : "Aucune offre recommandée trouvée pour le moment."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
