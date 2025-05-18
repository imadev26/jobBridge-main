"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

import { applicationService } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function ApplyPage() {
  const router = useRouter()
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  
  const [formData, setFormData] = useState({
    cv: null as File | null,
    coverLetter: null as File | null,
  })
  const [cvFileName, setCvFileName] = useState("")
  const [coverLetterFileName, setCoverLetterFileName] = useState("")

  const job = {
    id: id,
    title: "Développeur Frontend React",
    company: "Ministère de l'Éducation",
    location: "Rabat",
  }

  const { userId, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }

  }, [isAuthenticated, router, isLoading])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: "cv" | "coverLetter") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileContent = event.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          [fileType]: fileContent,
        }));
      };

      reader.readAsDataURL(file);

      if (fileType === "cv") {
        setCvFileName(file.name)
      } else if (fileType === "coverLetter") {
        setCoverLetterFileName(file.name);
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading) {
      toast.info("Loading authentication state...");
      return;
    }

    if (!isAuthenticated || !userId) {
      toast.error("You must be logged in to apply.");
      return;
    }

    if (!formData.cv) {
      toast.error("Please upload your CV.");
      return;
    }

    const applicationPayload = {
      offerId: id as string,
      cv: formData.cv,
      coverLetter: formData.coverLetter || "",
    };

    console.log('Sending application payload:', applicationPayload);

    try {
      const response = await applicationService.createApplication(applicationPayload);
      console.log('Application submission response:', response);
      toast.success("Candidature envoyée avec succès!");
      setTimeout(() => {
        router.push("/candidatures");
      }, 50);
    } catch (error: any) {
      console.error("Error submitting application:", error);
      const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de l'envoi de la candidature.";
      toast.error(errorMessage);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 bg-blue-600 text-white">
        <div className="container flex h-16 items-center px-4 mx-auto max-w-7xl">
          <Link href={`/job/${id}`} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Postuler</h1>
        </div>
      </div>

      <main className="flex-1 bg-gray-50">
        <div className="container px-4 py-6 mx-auto max-w-7xl">
          <div className="mb-6 bg-white p-4 rounded-md shadow-sm">
            <h2 className="text-lg font-semibold">{job.title}</h2>
            <p className="text-gray-600">{job.company}</p>
            <p className="text-gray-500">{job.location}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="text-lg font-medium mb-4">Documents</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cv" className="required">
                    CV (PDF, DOC)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center border-blue-600 text-blue-600"
                    onClick={() => document.getElementById("cv")?.click()}
                  >
                    {cvFileName || "Ajouter votre CV"}
                  </Button>
                  <Input
                    id="cv"
                    name="cv"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "cv")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Lettre de motivation (optionnelle)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => document.getElementById("coverLetter")?.click()}
                  >
                    {coverLetterFileName || "Ajouter une lettre de motivation"}
                  </Button>
                  <Input
                    id="coverLetter"
                    name="coverLetter"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "coverLetter")}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Soumettre ma candidature
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
