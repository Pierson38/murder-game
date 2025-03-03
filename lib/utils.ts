import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Génère un code aléatoire pour les joueurs
export function generatePlayerCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

