import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container px-4 py-8 md:px-6 md:py-12 mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">StageConnect</h3>
            <p className="text-sm text-gray-500">
              Trouvez le stage ou l&apos;alternance idéal pour votre parcours académique.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Liens rapides</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-blue-600">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-blue-600">
                  Recherche
                </Link>
              </li>
              <li>
                <Link href="/saved" className="hover:text-blue-600">
                  Offres sauvegardées
                </Link>
              </li>
              <li>
                <Link href="/applications" className="hover:text-blue-600">
                  Mes candidatures
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ressources</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Guide de candidature
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Conseils CV
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Préparation entretien
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="mailto:contact@stageconnect.ma" className="hover:text-blue-600">
                  contact@stageconnect.ma
                </Link>
              </li>
              <li>
                <Link href="tel:+212522000000" className="hover:text-blue-600">
                  +212 522 00 00 00
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-500">
          <p>© 2025 StageConnect. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
