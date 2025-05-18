import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgoInFrench(dateString: string | undefined): string {
  if (!dateString) return 'Date inconnue'; // Handle undefined or null input
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)
  const weeks = Math.round(days / 7)
  const months = Math.round(days / 30)
  const years = Math.round(days / 365)

  if (seconds < 60) return "Il y a quelques secondes"
  if (minutes < 60) return `Il y a ${minutes} minutes`
  if (hours < 24) return `Il y a ${hours} heures`
  if (days < 7) return `Il y a ${days} jours`
  if (weeks < 4) return `Il y a ${weeks} semaines`
  if (months < 12) return `Il y a ${months} mois`
  return `Il y a ${years} ans`;
}
