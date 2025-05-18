"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Search, ArrowLeft } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authService, internshipService } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Internship {
  id: number;
  title: string;
  company: string;
  location: string;
  duration: string;
  description: string;
  requirements: string;
  category: string;
  type: string;
  createdAt: string;
  status: "Ouvert" | "Fermé"; // Assuming status can only be "Ouvert" or "Fermé"
  applications: number;
}

interface FormData {
  title: string;
  company: string;
  location: string;
  duration: string;
  description: string;
  requirements: string;
  category: string;
  type: string;
  status: "Ouvert" | "Fermé";
}

export default function AdminInternships() {
  const router = useRouter()
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    company: "Ministère de l'Éducation",
    location: "",
    duration: "",
    description: "",
    requirements: "",
    category: "Technologie",
    type: "Stage",
    status: "Ouvert"
  })

  useEffect(() => {
    // Check if user is logged in and is admin
    const isLoggedIn = authService.isAuthenticated()
    const isAdmin = authService.isAdmin()

    if (!isLoggedIn || !isAdmin) {
      router.push("/login")
      return
    }

    fetchInternships()
  }, [router])

  const fetchInternships = async () => {
    setLoading(true)
    try {
      // For development: Use mock data if API fails
      try {
        const response = await internshipService.getAllInternships()
        setInternships(response.data)
      } catch (error) {
        console.error("Error fetching internships:", error)
        // Mock data
        setInternships([
          {
            id: 1,
            title: "Développeur Frontend React",
            company: "Ministère de l'Éducation",
            location: "Rabat",
            duration: "6 mois",
            description: "Développement d'interfaces utilisateur pour applications éducatives",
            requirements: "React, JavaScript, CSS avancé",
            category: "Technologie",
            type: "Stage",
            createdAt: "2023-05-15",
            status: "Ouvert",
            applications: 8
          },
          {
            id: 2,
            title: "Analyste de données éducatives",
            company: "Ministère de l'Éducation",
            location: "Casablanca",
            duration: "3 mois",
            description: "Analyse des données de performances scolaires",
            requirements: "Excel, Python, statistiques",
            category: "Éducation",
            type: "Stage",
            createdAt: "2023-05-10",
            status: "Ouvert",
            applications: 5
          },
          {
            id: 3,
            title: "Ingénieur DevOps",
            company: "Ministère de l'Éducation",
            location: "Rabat",
            duration: "6 mois",
            description: "Mise en place de pipelines CI/CD pour applications internes",
            requirements: "Docker, Jenkins, AWS/Azure",
            category: "Technologie",
            type: "Stage",
            createdAt: "2023-05-08",
            status: "Fermé",
            applications: 12
          }
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof FormData, value: "Ouvert" | "Fermé" | string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdd = () => {
    setSelectedInternship(null)
    setFormData({
      title: "",
      company: "Ministère de l'Éducation",
      location: "",
      duration: "",
      description: "",
      requirements: "",
      category: "Technologie",
      type: "Stage",
      status: "Ouvert"
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (internship: Internship) => {
    setSelectedInternship(internship)
    setFormData({
      title: internship.title,
      company: internship.company,
      location: internship.location,
      duration: internship.duration,
      description: internship.description,
      requirements: internship.requirements,
      category: internship.category,
      type: internship.type,
      status: internship.status
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (internship: Internship) => {
    setSelectedInternship(internship)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedInternship) return

    try {
      await internshipService.deleteInternship(selectedInternship.id.toString())
      setInternships(internships.filter((item) => item.id !== selectedInternship.id))
    } catch (error) {
      console.error("Error deleting internship:", error)
      // Mock delete for development
      setInternships(internships.filter((item) => item.id !== selectedInternship.id))
    }
    
    setIsDeleteDialogOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (selectedInternship) {
        // Update existing internship
        await internshipService.updateInternship(selectedInternship.id.toString(), formData)
        
        // Mock update for development
        setInternships(
          internships.map((item) => 
            item.id === selectedInternship.id ? { ...item, ...formData } as Internship : item
          )
        )
      } else {
        // Create new internship
        const response = await internshipService.createInternship(formData)
        
        // Mock create for development
        const newInternship: Internship = {
          id: internships.length + 1,
          ...formData,
          createdAt: new Date().toISOString().split('T')[0],
          applications: 0
        }
        setInternships([...internships, newInternship])
      }
      
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving internship:", error)
    }
  }

  // Filter internships based on search term
  const filteredInternships = internships.filter((internship) =>
    internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6 md:py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Link>
              <h1 className="text-2xl font-bold">Gestion des stages</h1>
            </div>
            <Button onClick={handleAdd} className="inline-flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Ajouter un stage
            </Button>
          </div>

          <div className="mb-6 w-full md:max-w-sm">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher des stages..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInternships.length > 0 ? (
                filteredInternships.map((internship) => (
                  <Card key={internship.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-4 gap-4 p-6">
                        <div className="col-span-3">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-semibold">{internship.title}</h3>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(internship)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(internship)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-500">{internship.company}</p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
                            <span>{internship.location}</span>
                            <span>•</span>
                            <span>{internship.duration}</span>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <Badge variant="outline" className="bg-blue-100 text-blue-700">
                              {internship.category}
                            </Badge>
                            <Badge variant="outline" className="bg-purple-100 text-purple-700">
                              {internship.type}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={internship.status === "Ouvert" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                            >
                              {internship.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center border-l md:border-l p-4">
                          <div className="text-2xl font-bold text-blue-600">{internship.applications}</div>
                          <div className="text-sm text-gray-500">Candidatures</div>
                          <div className="mt-2 text-xs text-gray-400">Créé le {internship.createdAt}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Aucun stage trouvé.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedInternship ? "Modifier le stage" : "Ajouter un nouveau stage"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Durée</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="requirements">Prérequis</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={2}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleSelectChange("category", value as "Ouvert" | "Fermé" | string)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technologie">Technologie</SelectItem>
                      <SelectItem value="Éducation">Éducation</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange("type", value as "Ouvert" | "Fermé" | string)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stage">Stage</SelectItem>
                      <SelectItem value="Alternance">Alternance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleSelectChange("status", value as "Ouvert" | "Fermé")}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ouvert">Ouvert</SelectItem>
                      <SelectItem value="Fermé">Fermé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Êtes-vous sûr de vouloir supprimer ce stage ? Cette action ne peut pas être annulée.
            </p>
            {selectedInternship && selectedInternship.applications > 0 && (
              <p className="mt-2 text-yellow-600">
                Ce stage a déjà {selectedInternship.applications} candidature(s). La suppression affectera ces candidatures.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  )
} 