"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"

interface EditProfileFormProps {
  onCancel: () => void
}

export function EditProfileForm({ onCancel }: EditProfileFormProps) {
  const [formData, setFormData] = useState({
    fullName: "ADAOUMOUM IMAD",
    education: "Licence en informatique",
    location: "Rabat, Maroc",
    about:
      "Étudiant en informatique passionné par le développement web et mobile. À la recherche d'opportunités de stage pour mettre en pratique mes compétences.",
    email: "",
    phone: "+212 600000000",
    website: "portfolio.imadadaoumoum.com",
  })

  useEffect(() => {
    // Get user profile from localStorage
    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}")
    setFormData((prev) => ({
      ...prev,
      fullName: userProfile.fullName ? userProfile.fullName.toUpperCase() : "ADAOUMOUM IMAD",
      education: userProfile.education || "Licence en informatique",
      location: userProfile.location || "Rabat, Maroc",
      email: userProfile.email || "imad.adaoumoum@example.com",
    }))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Save updated profile to localStorage
    localStorage.setItem(
      "userProfile",
      JSON.stringify({
        fullName: formData.fullName.toUpperCase(),
        email: formData.email,
        education: formData.education,
        location: formData.location,
        about: formData.about,
      }),
    )

    onCancel() // Return to profile view after saving
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6 md:py-8">
          <div className="mb-6 flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au profil
            </Button>
            <h1 className="text-2xl font-bold">Modifier le profil</h1>
          </div>

          <div className="mx-auto max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="rounded-full overflow-hidden h-24 w-24">
                      <Avatar className="h-full w-full">
                        <AvatarImage
                          src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
                          alt="Avatar"
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {formData.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <Button variant="outline" size="sm">
                      Changer la photo
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nom complet</Label>
                        <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="education">Formation</Label>
                        <Input id="education" name="education" value={formData.education} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Localisation</Label>
                      <Input id="location" name="location" value={formData.location} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="about">À propos</Label>
                      <Textarea id="about" name="about" rows={4} value={formData.about} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Coordonnées</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Site web</Label>
                      <Input id="website" name="website" value={formData.website} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Annuler
                    </Button>
                    <Button type="submit">Enregistrer les modifications</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
