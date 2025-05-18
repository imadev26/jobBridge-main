"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import api from "@/lib/api"
import Link from "next/link"
import { timeAgoInFrench } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Share2 } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { use } from "react"

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

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [offerId, setOfferId] = useState<string | undefined>(undefined)
  const [offer, setOffer] = useState<JobOffer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, role, userId } = useAuth()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    Promise.resolve(params).then(resolvedParams => {
      if (resolvedParams && resolvedParams.id && typeof resolvedParams.id === 'string') {
        setOfferId(resolvedParams.id)
      } else {
        setError("ID d'offre invalide.")
        setLoading(false)
      }
    })
  }, [params])

  useEffect(() => {
    if (!offerId) {
      if (!loading && !error) {
        setLoading(false)
      }
      return
    }

    console.log('Fetching offer with ID:', offerId)

    const fetchOffer = async () => {
      try {
        const response = await api.get(`/offers/${offerId}`)
        setOffer(response.data)
        const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]')
        setIsSaved(savedJobs.includes(offerId))
      } catch (err: any) {
        console.error("Error fetching offer:", err)
        setError("Erreur lors du chargement de l'offre.")
        toast.error("Erreur lors du chargement de l'offre.")
      } finally {
        setLoading(false)
      }
    }

    fetchOffer()
  }, [offerId])

  const handleApply = () => {
    if (!isAuthenticated || !userId) {
      toast.info("Veuillez vous connecter pour postuler.")
      router.push("/login")
      return
    }
    if (role !== "STUDENT") {
      toast.warning("Seuls les étudiants peuvent postuler.")
      return
    }

    router.push(`/job/${offerId}/apply`)
  }

  const handleSave = () => {
    if (!isAuthenticated || !userId) {
      toast.info("Veuillez vous connecter pour sauvegarder des offres.")
      router.push("/login")
      return
    }

    if (role !== "STUDENT") {
      toast.warning("Seuls les étudiants peuvent sauvegarder des offres.")
      return
    }

    try {
      const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]')
      console.log('Current saved jobs:', savedJobs)
      
      if (isSaved) {
        const updatedSavedJobs = savedJobs.filter((id: string) => id !== offerId)
        localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs))
        setIsSaved(false)
        toast.success("Offre retirée des sauvegardes")
      } else {
        if (!savedJobs.includes(offerId)) {
          if (typeof offerId === 'string') {
            savedJobs.push(offerId)
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs))
            setIsSaved(true)
            toast.success("Offre sauvegardée avec succès!")
          } else {
            console.error('Attempted to save invalid offer ID (not a string):', offerId)
            toast.error("Impossible de sauvegarder l'offre: ID invalide.")
          }
        } else {
          toast.info("Cette offre est déjà sauvegardée")
        }
      }
      console.log('Updated saved jobs:', JSON.parse(localStorage.getItem('savedJobs') || '[]'))
    } catch (err) {
      console.error("Error saving offer:", err)
      toast.error("Une erreur est survenue lors de la sauvegarde de l'offre.")
    }
  }

  if (loading) {
    return <div className="container mx-auto py-6 text-center">Chargement...</div>
  }

  if (error) {
    return <div className="container mx-auto py-6 text-center text-red-500">{error}</div>
  }

  if (!offer) {
    return <div className="container mx-auto py-6 text-center">Offre non trouvée.</div>
  }

  const requirements = Array.isArray(offer.requirements) ? offer.requirements : []

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6 md:py-8 mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-2">
            <Link href="/search" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" />
              Retour aux résultats
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">{offer.title}</CardTitle>
                  <CardDescription className="text-gray-600">{offer.company} - {offer.location}</CardDescription>
                  <div className="text-sm text-gray-500 mt-2">
                    Publié {timeAgoInFrench(offer.createdAt)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description de l&apos;offre</h3>
                    <p className="text-gray-700">{offer.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Exigences</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Détails</h3>
                    <p className="text-gray-700">Salaire: {offer.salary}</p>
                    <p className="text-gray-700">Type d&apos;emploi: {offer.type}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">Postuler</h2>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg" onClick={handleApply}>
                    Postuler maintenant
                  </Button>
                  <p className="mt-4 text-center text-sm text-gray-500">
                    ou{" "}
                    <button 
                      onClick={handleSave} 
                      className={`text-blue-600 hover:underline ${isSaved ? 'font-bold' : ''}`}
                    >
                      {isSaved ? 'Retirer des sauvegardes' : 'Sauvegarder'}
                    </button>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
