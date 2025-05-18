"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import api from "@/lib/api"

const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum(["STUDENT", "COMPANY"]),
  address: z.string().optional(),
  contact: z.string().optional(),
}).refine((data) => {
  if (data.role === "COMPANY") {
    return !!data.address && !!data.contact
  }
  return true
}, {
  message: "L'adresse et le contact sont requis pour les entreprises",
  path: ["address"]
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
      address: "",
      contact: "",
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await api.post("/auth/register", data)
      toast.success("Compte créé avec succès!")
      router.push("/login")
    } catch (error) {
      toast.error("Erreur lors de la création du compte")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 px-4 sm:px-0">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
          <ArrowLeft className="h-4 w-4" />
          Accueil
        </Link>
      </div>
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Créer un compte</h1>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez JobBridge et commencez votre carrière
          </p>
        </div>
        <div className="mt-8 rounded-lg bg-white px-6 py-8 shadow sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Type de compte</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="STUDENT" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Étudiant
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="COMPANY" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Entreprise
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Entrez votre nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Entrez votre email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Créez un mot de passe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("role") === "COMPANY" && (
                <>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse de l'entreprise" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Numéro de téléphone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="text-xs text-gray-500">
                En créant un compte, vous acceptez nos{" "}
                <Link href="#" className="text-blue-600 hover:underline">
                  Conditions d&apos;utilisation
                </Link>{" "}
                et notre{" "}
                <Link href="#" className="text-blue-600 hover:underline">
                  Politique de confidentialité
                </Link>
              </div>

              <Button type="submit" className="w-full">
                Créer un compte
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            <p>
              Vous avez déjà un compte ?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
