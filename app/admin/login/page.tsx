"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const ADMIN_CODE = "123456" // Dans une vraie application, ce code serait stocké de manière sécurisée

export default function AdminLogin() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (code === ADMIN_CODE) {
      localStorage.setItem("adminAuthenticated", "true")
      router.push("/admin")
    } else {
      setError("Code incorrect. Veuillez réessayer.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion Administrateur</CardTitle>
          <CardDescription>Entrez le code administrateur pour accéder au dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Entrez le code administrateur"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full">
              Connexion
            </Button>
            <Link href="/" className="text-sm text-primary hover:underline">
              Retour à l'accueil
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

