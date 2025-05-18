"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import api from "@/lib/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Veuillez saisir votre email et mot de passe.")
      toast({
        title: "Erreur de connexion",
        description: "Veuillez saisir votre email et mot de passe.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      })

      if (response.data && response.data.token && response.data.userId && response.data.role) {
        login(response.data.token, response.data.userId, response.data.role)
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        })
        // Redirect based on role
        if (response.data.role === "STUDENT") {
          router.push("/")
        } else if (response.data.role === "COMPANY") {
          router.push("/company/dashboard")
        } else {
          router.push("/")
        }
      } else {
        setError("Échec de la connexion. Réponse invalide du serveur.")
        toast({
          title: "Erreur de connexion",
          description: "Réponse invalide du serveur.",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Login error:", err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Une erreur est survenue lors de la connexion."
      setError(errorMessage)
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Se connecter</CardTitle>
          <CardDescription className="text-center">
            Entrez vos informations pour vous connecter à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Vous n&apos;avez pas de compte ?{" "}
            <Link href="/register" className="underline">
              S&apos;inscrire
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
