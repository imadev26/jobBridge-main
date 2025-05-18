import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="container flex flex-col items-center px-4 py-12 text-center md:px-6 md:py-24">
          <div className="mx-auto max-w-3xl space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Trouvez votre stage idéal</h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              Parcourez des centaines d&apos;offres de stages et d&apos;alternances dans les institutions publiques
            </p>
          </div>
          <div className="mt-8">
            <img
              src="/placeholder.svg?height=400&width=600"
              alt="Étudiants en stage"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
              width={600}
              height={400}
            />
          </div>
          <div className="mt-8 flex justify-center">
            <Button size="lg" asChild>
              <Link href="/">Suivant</Link>
            </Button>
          </div>
          <div className="mt-8 flex justify-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
