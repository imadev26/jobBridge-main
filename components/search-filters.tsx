"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Filter, X } from "lucide-react"

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    sector: string;
    location: string;
    duration: string;
    type: string;
  }) => void;
}

export function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    sector: "",
    location: "",
    duration: "",
    type: "all"
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      sector: "",
      location: "",
      duration: "",
      type: "all"
    }
    setFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Filter className="h-4 w-4" />
          Rechercher
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <span>Filtres de recherche</span>
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </DialogClose>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">Secteur d&apos;activité</h3>
            <div className="flex flex-wrap gap-2">
              {["Technologie", "Éducation", "Santé", "Finance", "Ingénierie", "Marketing"].map((sector) => (
                <Button
                  key={sector}
                  variant={filters.sector === sector ? "default" : "outline"}
                  className="rounded-full"
                  size="sm"
                  onClick={() => handleFilterChange("sector", filters.sector === sector ? "" : sector)}
                >
                  {sector}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              placeholder="Ville, région, etc."
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Durée</Label>
            <Input
              id="duration"
              placeholder="Ex: 3 mois, 6 mois, etc."
              value={filters.duration}
              onChange={(e) => handleFilterChange("duration", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Type de contrat</h3>
            <RadioGroup
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">Tous</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="stage" id="stage" />
                <Label htmlFor="stage">Stage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="alternance" id="alternance" />
                <Label htmlFor="alternance">Alternance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="temps-partiel" id="temps-partiel" />
                <Label htmlFor="temps-partiel">Temps partiel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="temps-plein" id="temps-plein" />
                <Label htmlFor="temps-plein">Temps plein</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>Réinitialiser</Button>
            <Button onClick={() => setIsOpen(false)}>Appliquer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
