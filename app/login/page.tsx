"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getPlayerByCode } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Login() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const player = getPlayerByCode(code)
    if (player) {
      // Dans une vraie application, on utiliserait une session
      router.push(`/player/${player.id}`)
    } else {
      setError("Code invalide. Veuillez réessayer.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion Joueur</CardTitle>
          <CardDescription>Entrez votre code joueur pour accéder à votre mission</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Entrez votre code (ex: ABC123)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="uppercase"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full">
              Connexion
            </Button>
            <div className="flex justify-between w-full text-sm">
              <Link href="/" className="text-sm text-primary hover:underline">
                Retour à l'accueil
              </Link>
              <Link href="/admin" className="text-sm text-muted-foreground hover:underline">
                Administration
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

